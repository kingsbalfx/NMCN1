const express = require("express");
const pool = require("../../config/db");
const auth = require("../../middleware/auth");
const paid = require("../../middleware/subscription");

const router = express.Router();

/**
 * START CBT EXAM
 */
router.post("/cbt/start", auth, paid, async (req, res) => {
  const { topic_id, limit } = req.body;

  const questions = await pool.query(
    `
    SELECT id, question, options
    FROM questions
    WHERE topic_id=$1 AND type='mcq'
    ORDER BY RANDOM()
    LIMIT $2
    `,
    [topic_id, limit || 50]
  );

  res.json({
    duration: 60 * 60, // 1 hour
    questions: questions.rows,
  });
});

/**
 * SUBMIT CBT EXAM
 */
router.post("/cbt/submit", auth, paid, async (req, res) => {
  const { answers, exam_id } = req.body;

  let score = 0;

  for (let q of answers) {
    const correct = await pool.query(
      "SELECT correct_answer FROM questions WHERE id=$1",
      [q.question_id]
    );
    if (correct.rows[0].correct_answer === q.answer) score++;
  }

  await pool.query(
    "INSERT INTO results(user_id, exam_id, score, details) VALUES($1,$2,$3,$4)",
    [req.user.id, exam_id, score, { answers }]
  );

  res.json({ score });
});

/**
 * CLINICAL / OSCE EXAMS
 */
router.get("/clinical/:topicId", auth, paid, async (req, res) => {
  const questions = await pool.query(
    `
    SELECT id, question
    FROM questions
    WHERE topic_id=$1 AND type='clinical'
    `,
    [req.params.topicId]
  );

  res.json(questions.rows);
});

module.exports = router;
