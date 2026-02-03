const express = require("express");
const pool = require("../../config/db");
const auth = require("../../middleware/auth");
const paid = require("../../middleware/subscription");
const nursingQuestionsBank = require("../../../nursing_questions");

const router = express.Router();

// Base index to avoid 404 on /api/exams
router.get('/', (req, res) => {
  res.json({ message: 'Exams root — endpoints: POST /cbt/start, POST /cbt/submit, GET /clinical/:topicId' });
});

/**
 * START CBT EXAM (PUBLIC - DEMO)
 */
router.post("/cbt/start", async (req, res) => {
  try {
    const { topic_id, limit } = req.body;

    if (!topic_id) {
      return res.status(400).json({ error: "topic_id is required" });
    }

    let questions = [];

    // Try database first if available
    if (!pool.isDemoMode) {
      try {
        const dbQuestions = await pool.query(
          `
          SELECT id, question, options
          FROM questions
          WHERE topic_id=$1 AND type='mcq'
          ORDER BY RANDOM()
          LIMIT $2
          `,
          [topic_id, limit || 50]
        );
        questions = dbQuestions.rows;
      } catch (dbErr) {
        console.error("Database query failed, falling back:", dbErr.message);
      }
    }

    // Fallback to nursing questions
    if (!questions.length) {
      const allQuestions = nursingQuestionsBank.getQuestionsByTopic(topic_id);
      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
      questions = shuffled.slice(0, limit || 50).map((q, i) => ({
        id: q.id || i + 1,
        question: q.question,
        options: q.options
      }));
    }

    if (!questions.length) {
      return res.status(404).json({ error: "No questions found for this topic" });
    }

    res.json({
      duration: 60 * 60, // 1 hour
      questions: questions,
      count: questions.length,
      message: "Exam started successfully"
    });
  } catch (err) {
    console.error("Exam start error:", err);
    res.status(500).json({ error: "Failed to start exam" });
  }
});

/**
 * SUBMIT CBT EXAM
 */
router.post("/cbt/submit", async (req, res) => {
  try {
    const { answers, exam_id } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: "answers array is required" });
    }

    // Demo mode - calculate score locally
    let score = 0;
    const total = answers.length;

    for (let a of answers) {
      if (a.correct_answer && a.user_answer && a.correct_answer === a.user_answer) {
        score++;
      } else if (!pool.isDemoMode && a.question_id) {
        // If DB is available, verify correct answer from DB
        try {
          const correct = await pool.query(
            "SELECT correct_answer FROM questions WHERE id=$1",
            [a.question_id]
          );
          if (correct.rows.length && correct.rows[0].correct_answer === a.user_answer) {
            score++;
          }
        } catch (e) {
          // ignore DB errors and continue
        }
      }
    }

    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    // Optionally save the result
    if (!pool.isDemoMode) {
      try {
        await pool.query(
          "INSERT INTO results(user_id, exam_id, score, total, percentage, details) VALUES($1,$2,$3,$4,$5,$6)",
          [req.user?.id || null, exam_id || null, score, total, percentage, JSON.stringify({ answers })]
        );
      } catch (e) {
        console.error("Failed to persist exam result:", e.message);
      }
    }

    res.json({
      message: "Exam submitted successfully",
      score,
      total,
      percentage,
      passed: percentage >= 50
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

    if (pool.isDemoMode) {
      // Fallback: return sample clinical prompts from the questions bank
      const all = nursingQuestionsBank.getQuestionsByTopic(topicId) || [];
      return res.json(all.map(q => ({ id: q.id, question: q.question }))).status(200);
    }

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
