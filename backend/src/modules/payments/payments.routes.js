const express = require("express");
const axios = require("axios");
const pool = require("../../config/db");
const auth = require("../../middleware/auth");

const router = express.Router();

/**
 * INITIATE PAYMENT
 */
router.post("/initiate", auth, async (req, res) => {
  const { amount } = req.body;

  const user = await pool.query(
    "SELECT email FROM users WHERE id=$1",
    [req.user.id]
  );

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
});

/**
 * VERIFY PAYMENT
 */
router.get("/verify/:reference", auth, async (req, res) => {
  const { reference } = req.params;

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

    return res.json({ message: "Subscription activated", expiry });
  }

  res.status(400).json({ error: "Payment not successful" });
});

module.exports = router;
