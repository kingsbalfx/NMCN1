const express = require("express");
const pool = require("../../config/db");
const auth = require("../../middleware/auth");

const router = express.Router();

// Base index to avoid 404 on /api/users
router.get('/', (req, res) => {
  res.json({ message: 'Users root — endpoints: /profile, /exam-history' });
});

/**
 * GET user profile (PROTECTED)
 */
router.get("/profile", auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Try database first
    if (!pool.isDemoMode) {
      try {
        const user = await pool.query(
          "SELECT id, full_name, email, role, subscription_expiry, created_at FROM users WHERE id=$1",
          [userId]
        );

        if (user.rows.length) {
          return res.json(user.rows[0]);
        }
      } catch (dbErr) {
        console.error("Database error, falling back to demo data:", dbErr.message);
      }
    }

    // Demo mode
    res.json({
      id: userId,
      full_name: "Demo User",
      email: "demo@kingsbal.com",
      role: "student",
      subscription_expiry: "2025-12-31",
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

/**
 * UPDATE user profile (PROTECTED)
 */
router.put("/profile", auth, async (req, res) => {
  try {
    const { full_name, phone } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    // Try database first
    if (!pool.isDemoMode) {
      try {
        const result = await pool.query(
          "UPDATE users SET full_name=$1, phone=$2, updated_at=NOW() WHERE id=$3 RETURNING *",
          [full_name, phone, userId]
        );
        return res.json({ message: "Profile updated", user: result.rows[0] });
      } catch (dbErr) {
        console.error("Database error, falling back to demo response:", dbErr.message);
      }
    }

    // Demo mode
    res.json({ 
      message: "Profile updated (demo mode)", 
      user: { 
        id: userId, 
        full_name: full_name || "Demo User", 
        phone 
      } 
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

/**
 * GET user exam history (PROTECTED)
 */
router.get("/exam-history", auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Try database first
    if (!pool.isDemoMode) {
      try {
        const history = await pool.query(
          `SELECT id, exam_id, score, percentage, passed, created_at 
           FROM exam_submissions WHERE user_id=$1 ORDER BY created_at DESC`,
          [userId]
        );
        return res.json(history.rows);
      } catch (dbErr) {
        console.error("Database error, falling back to demo data:", dbErr.message);
      }
    }

    // Demo mode
    res.json([
      {
        id: 1,
        exam_id: "anatomy-001",
        score: 85,
        percentage: 85,
        passed: true,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        exam_id: "pharmacology-001",
        score: 72,
        percentage: 72,
        passed: true,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]);
  } catch (err) {
    console.error("Exam history fetch error:", err);
    res.status(500).json({ error: "Failed to fetch exam history" });
  }
});

/**
 * TEST ROUTE
 */
router.get("/test", (req, res) => {
  res.json({ 
    message: "Users route works ✅",
    features: [
      "GET /api/users/profile - Get user profile (protected)",
      "PUT /api/users/profile - Update profile (protected)",
      "GET /api/users/exam-history - Get exam history (protected)"
    ]
  });
});

module.exports = router;
