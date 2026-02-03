const express = require("express");
const axios = require("axios");
const pool = require("../../config/db");
const auth = require("../../middleware/auth");

const router = express.Router();

// Base index to avoid 404 on /api/payments
router.get('/', (req, res) => {
  res.json({ message: 'Payments root — endpoints: POST /initiate, GET /verify/:reference, GET /status/:reference' });
});

/**
 * INITIATE PAYMENT
 */
router.post("/initiate", auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user?.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valid amount is required" });
    }

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Demo mode
    if (pool.isDemoMode) {
      return res.json({
        status: "success",
        message: "Payment initiated (demo mode)",
        reference: "DEMO_" + Math.random().toString(36).substring(7).toUpperCase(),
        amount: amount,
        authorization_url: "https://checkout.paystack.com/demo",
        access_code: "demo_access_code",
        demo: true
      });
    }

    // Real payment
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ error: "Paystack configuration missing" });
    }

    try {
      const user = await pool.query(
        "SELECT email FROM users WHERE id=$1",
        [userId]
      );

      if (!user.rows.length) {
        return res.status(404).json({ error: "User not found" });
      }

      const response = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        {
          email: user.rows[0].email,
          amount: amount * 100
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      res.json(response.data.data);
    } catch (payErr) {
      console.error("Paystack error:", payErr.message);
      res.status(500).json({ error: "Payment gateway error" });
    }
  } catch (err) {
    console.error("Payment initiation error:", err.message);
    res.status(500).json({ error: "Failed to initiate payment" });
  }
});

/**
 * VERIFY PAYMENT
 */
router.get("/verify/:reference", auth, async (req, res) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({ error: "Reference is required" });
    }

    // Demo mode
    if (pool.isDemoMode) {
      const verified = reference.startsWith("DEMO_");
      if (verified) {
        return res.json({
          status: "success",
          message: "Payment verified (demo mode)",
          reference,
          verified: true,
          amount: 5000
        });
      }
      return res.status(400).json({ error: "Demo reference invalid" });
    }

    // Real verification
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ error: "Paystack configuration missing" });
    }

    try {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
          }
        }
      );

      const data = response.data.data;

      if (data.status === "success") {
        // Activate subscription for the user
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 1);

        try {
          await pool.query(
            "UPDATE users SET subscription_expiry=$1 WHERE id=$2",
            [expiry, req.user.id]
          );
        } catch (e) {
          console.error("Failed to update subscription expiry:", e.message);
        }

        return res.json({ message: "Subscription activated successfully", expiry, status: "success" });
      }

      res.status(400).json({ error: "Payment verification failed", status: data.status });
    } catch (payErr) {
      console.error("Paystack error:", payErr.message);
      res.status(500).json({ error: "Payment verification failed" });
    }
  } catch (err) {
    console.error("Payment verification error:", err.message);
    res.status(500).json({ error: "Failed to verify payment" });
  }
});

/**
 * GET payment status
 */
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

/**
 * TEST ROUTE
 */
router.get("/test", (req, res) => {
  res.json({ message: "Payments route works ✅" });
});

module.exports = router;
