const express = require("express");
const pool = require("../../config/db");
const auth = require("../../middleware/auth");

const router = express.Router();

/**
 * GET user profile
 */
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await pool.query(
      "SELECT id, full_name, email, role, subscription_expiry, created_at FROM users WHERE id=$1",
      [req.user.id]
    );

    if (!user.rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user.rows[0]);
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

/**
 * UPDATE user profile
 */
router.put("/profile", auth, async (req, res) => {
  try {
    const { full_name, phone } = req.body;
    
    const result = await pool.query(
      "UPDATE users SET full_name=$1, phone=$2, updated_at=NOW() WHERE id=$3 RETURNING *",
      [full_name, phone, req.user.id]
    );

    res.json({ message: "Profile updated", user: result.rows[0] });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

/**
 * GET user exam history
 */
router.get("/exam-history", auth, async (req, res) => {
  try {
    const results = await pool.query(
      `SELECT r.id, r.exam_id, r.score, r.total, r.percentage, r.created_at
       FROM results r
       WHERE r.user_id=$1
       ORDER BY r.created_at DESC
       LIMIT 20`,
      [req.user.id]
    );

    res.json(results.rows);
  } catch (err) {
    console.error("Exam history error:", err);
    res.status(500).json({ error: "Failed to fetch exam history" });
  }
});

/**
 * TEST ROUTE
 */
router.get("/test", (req, res) => {
  res.json({ message: "Users route works ✅" });
});

module.exports = router;
