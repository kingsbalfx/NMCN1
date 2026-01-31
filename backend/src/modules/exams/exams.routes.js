const express = require("express");
const pool = require("../../config/db");
const auth = require("../../middleware/auth");
const paid = require("../../middleware/subscription");

const router = express.Router();

/**
 * START CBT EXAM
 */
router.post("/cbt/start", auth, paid, async (req, res) => {
  try {
    const { topic_id, limit } = req.body;

    if (!topic_id) {
      return res.status(400).json({ error: "topic_id is required" });
    }

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

    if (!questions.rows.length) {
      return res.status(404).json({ error: "No questions found for this topic" });
    }

    res.json({
      duration: 60 * 60, // 1 hour
      questions: questions.rows,
    });
  } catch (err) {
    console.error("Exam start error:", err);
    res.status(500).json({ error: "Failed to start exam" });
  }
});

/**
 * SUBMIT CBT EXAM
 */
router.post("/cbt/submit", auth, paid, async (req, res) => {
  try {
    const { answers, exam_id } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: "answers array is required" });
    }

    let score = 0;
    let total = answers.length;

    for (let q of answers) {
      const correct = await pool.query(
        "SELECT correct_answer FROM questions WHERE id=$1",
        [q.question_id]
      );

      if (correct.rows.length && correct.rows[0].correct_answer === q.answer) {
        score++;
      }
    }

    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    const result = await pool.query(
      "INSERT INTO results(user_id, exam_id, score, total, percentage, details) VALUES($1,$2,$3,$4,$5,$6) RETURNING *",
      [req.user.id, exam_id || null, score, total, percentage, JSON.stringify({ answers })]
    );

    res.json({
      message: "Exam submitted successfully",
      score,
      total,
      percentage,
      result: result.rows[0]
    });
  } catch (err) {
    console.error("Exam submit error:", err);
    res.status(500).json({ error: "Failed to submit exam" });
  }
});

/**
 * CLINICAL / OSCE EXAMS
 */
router.get("/clinical/:topicId", auth, paid, async (req, res) => {
  try {
    const { topicId } = req.params;

    const questions = await pool.query(
      `
      SELECT id, question
      FROM questions
      WHERE topic_id=$1 AND type='clinical'
      `,
      [topicId]
    );

    res.json(questions.rows);
  } catch (err) {
    console.error("Clinical exams error:", err);
    res.status(500).json({ error: "Failed to fetch clinical exams" });
  }
});

/**
 * TEST ROUTE
 */
router.get("/test", (req, res) => {
  res.json({ message: "Exams route works ✅" });
});

module.exports = router;
