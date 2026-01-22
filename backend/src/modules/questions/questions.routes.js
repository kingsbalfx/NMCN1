const express = require("express");
const pool = require("../../config/db");
const auth = require("../../middleware/auth");
const paid = require("../../middleware/subscription");

const router = express.Router();

router.get("/:topicId", auth, paid, async (req, res) => {
  const { topicId } = req.params;

  const questions = await pool.query(
    "SELECT * FROM questions WHERE topic_id = $1 ORDER BY difficulty",
    [topicId]
  );

  res.json(questions.rows);
});

module.exports = router;
