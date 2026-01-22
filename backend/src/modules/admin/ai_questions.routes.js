const express = require("express");
const pool = require("../../config/db");
const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const { generateQuestion } = require("../../utils/ai");

const router = express.Router();

/**
 * Generate multiple questions for a topic
 */
router.post("/generate", auth, admin, async (req, res) => {
  const { topic_id, type, difficulty, count } = req.body;
  let generated = [];

  for (let i = 0; i < count; i++) {
    const topicData = await pool.query("SELECT title FROM topics WHERE id=$1", [topic_id]);
    const topic = topicData.rows[0].title;

    const q = await generateQuestion({ topic, type, difficulty });

    await pool.query(
      `INSERT INTO questions(topic_id,type,difficulty,question,options,correct_answer,explanation)
       VALUES($1,$2,$3,$4,$5,$6,$7)`,
      [topic_id, type, difficulty, q.question, q.options, q.correct_answer, q.explanation]
    );

    generated.push(q);
  }

  res.json({ message: `Generated ${generated.length} questions`, generated });
});

module.exports = router;
