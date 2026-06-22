const express = require("express");
const axios = require("axios");
const pool = require("../../config/db");
const auth = require("../../middleware/auth");
const crypto = require("crypto");

const router = express.Router();
const ACCESS_PRICE_NAIRA = 450;

router.get("/", (req, res) => {
  res.json({
    message: "Payments root - endpoints: POST /initiate, GET /verify/:reference, GET /status/:reference",
    product: {
      name: "Permanent student access",
      amount: ACCESS_PRICE_NAIRA,
      currency: "NGN"
    }
  });
});

router.post("/initiate", auth, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (pool.isDemoMode) {
      return res.json({
        status: "success",
        message: "Payment initiated (demo mode)",
        reference: "DEMO_" + Math.random().toString(36).substring(7).toUpperCase(),
        amount: ACCESS_PRICE_NAIRA,
        currency: "NGN",
        access_type: "permanent",
        authorization_url: "https://checkout.paystack.com/demo",
        access_code: "demo_access_code",
        demo: true
      });
    }

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ error: "Paystack configuration missing" });
    }

    const user = await pool.query("SELECT email FROM users WHERE id=$1", [userId]);
    if (!user.rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: user.rows[0].email,
        amount: ACCESS_PRICE_NAIRA * 100,
        metadata: {
          student_id: userId,
          access_type: "permanent",
          product: "nursequest_lifetime_access"
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({
      ...response.data.data,
      amount: ACCESS_PRICE_NAIRA,
      currency: "NGN",
      access_type: "permanent"
    });
  } catch (err) {
    console.error("Payment initiation error:", err.message);
    res.status(500).json({ error: "Failed to initiate payment" });
  }
});

router.get("/verify/:reference", auth, async (req, res) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({ error: "Reference is required" });
    }

    if (pool.isDemoMode) {
      if (!reference.startsWith("DEMO_")) {
        return res.status(400).json({ error: "Demo reference invalid" });
      }

      return res.json({
        status: "success",
        message: "Permanent access activated (demo mode)",
        reference,
        verified: true,
        amount: ACCESS_PRICE_NAIRA,
        currency: "NGN",
        permanent_access: true
      });
    }

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ error: "Paystack configuration missing" });
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const data = response.data.data;

    if (data.status !== "success") {
      return res.status(400).json({ error: "Payment verification failed", status: data.status });
    }

    await pool.query(
      "UPDATE users SET has_paid=true, permanent_access=true, paid_at=NOW(), payment_reference=$1, updated_at=NOW() WHERE id=$2",
      [reference, req.user.id]
    );

    return res.json({
      message: "Permanent access activated successfully",
      status: "success",
      amount: ACCESS_PRICE_NAIRA,
      currency: "NGN",
      permanent_access: true
    });
  } catch (err) {
    console.error("Payment verification error:", err.message);
    res.status(500).json({ error: "Failed to verify payment" });
  }
});

router.get("/status/:reference", auth, async (req, res) => {
  try {
    const { reference } = req.params;

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ error: "Paystack configuration missing" });
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    res.json(response.data.data);
  } catch (err) {
    console.error("Payment status error:", err.message);
    res.status(500).json({ error: "Failed to fetch payment status" });
  }
});

router.get("/test", (req, res) => {
  res.json({ message: "Payments route works" });
});

router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const signature = req.headers["x-paystack-signature"];
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body || {}));

    if (!secret) {
      return res.status(500).send("Paystack configuration missing");
    }

    if (!signature) {
      return res.status(400).send("No signature");
    }

    const expectedSignature = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).send("Invalid signature");
    }

    const event = JSON.parse(rawBody.toString("utf8"));

    if (event.event === "charge.success") {
      const { metadata } = event.data;

      if (metadata?.student_id) {
        await pool.query(
          "UPDATE users SET has_paid=true, permanent_access=true, paid_at=NOW(), payment_reference=$1, updated_at=NOW() WHERE id=$2",
          [event.data.reference, metadata.student_id]
        );

        await pool.query(
          "INSERT INTO payments (user_id, reference, amount, status, created_at) VALUES ($1, $2, $3, $4, $5)",
          [metadata.student_id, event.data.reference, event.data.amount / 100, "success", new Date()]
        );

        console.log(`Permanent access activated for user ${metadata.student_id}`);
      }
    }

    res.status(200).send("OK");
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
