const express = require("express");
const pool = require("../../config/db");
const auth = require("../../middleware/auth");
const paid = require("../../middleware/subscription");

const router = express.Router();

/**
 * TEST ROUTE (PUBLIC)
 * https://your-domain/api/questions/test
 */
router.get("/test", (req, res) => {
  res.json({ message: "Questions route works ✅" });
});

/**
 * REAL QUESTIONS ROUTE (PROTECTED)
 * https://your-domain/api/questions/:topicId
 */
router.get("/:topicId", auth, paid, async (req, res) => {
  try {
    const { topicId } = req.params;

    const questions = await pool.query(
      "SELECT * FROM questions WHERE topic_id = $1 ORDER BY difficulty",
      [topicId]
    );

    res.json(questions.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

module.exports = router;
