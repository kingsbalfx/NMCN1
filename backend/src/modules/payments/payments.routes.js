const express = require("express");
const axios = require("axios");
const pool = require("../../config/db");
const auth = require("../../middleware/auth");

const router = express.Router();

/**
 * INITIATE PAYMENT
 */
router.post("/initiate", auth, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valid amount is required" });
    }

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ error: "Paystack configuration missing" });
    }

    const user = await pool.query(
      "SELECT email FROM users WHERE id=$1",
      [req.user.id]
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
      return res.status(400).json({ error: "Payment reference is required" });
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

    if (response.data.data.status === "success") {
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + 1); // 1-month subscription

      await pool.query(
        "UPDATE users SET subscription_expiry=$1 WHERE id=$2",
        [expiry, req.user.id]
      );

      return res.json({
        message: "Subscription activated successfully",
        expiry,
        status: "success"
      });
    }

    res.status(400).json({ error: "Payment verification failed", status: response.data.data.status });
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
