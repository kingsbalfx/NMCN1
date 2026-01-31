const express = require("express");
const pool = require("../../config/db");
const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const { generateQuestion } = require("../../utils/ai");

const router = express.Router();

/**
 * Generate multiple AI questions for a topic
 */
router.post("/generate", auth, admin, async (req, res) => {
  try {
    const { topic_id, type, difficulty, count } = req.body;

    // Validation
    if (!topic_id || !type || !difficulty || !count) {
      return res.status(400).json({
        error: "topic_id, type, difficulty, and count are required"
      });
    }

    if (count < 1 || count > 50) {
      return res.status(400).json({ error: "count must be between 1 and 50" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OpenAI API key not configured" });
    }

    // Fetch topic
    const topicData = await pool.query(
      "SELECT id, title FROM topics WHERE id=$1",
      [topic_id]
    );

    if (!topicData.rows.length) {
      return res.status(404).json({ error: "Topic not found" });
    }

    const topic = topicData.rows[0].title;
    let generated = [];
    let failed = [];

    for (let i = 0; i < count; i++) {
      try {
        const q = await generateQuestion({ topic, type, difficulty });

        const result = await pool.query(
          `INSERT INTO questions(topic_id, type, difficulty, question, options, correct_answer, explanation)
           VALUES($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
          [
            topic_id,
            type,
            difficulty,
            q.question,
            JSON.stringify(q.options),
            q.correct_answer,
            q.explanation
          ]
        );

        generated.push(result.rows[0]);
      } catch (qErr) {
        console.error(`Failed to generate question ${i + 1}:`, qErr.message);
        failed.push({ index: i + 1, error: qErr.message });
      }
    }

    res.status(201).json({
      message: `Generated ${generated.length}/${count} questions`,
      generated,
      failed: failed.length > 0 ? failed : undefined,
      summary: {
        total: count,
        successful: generated.length,
        failed: failed.length
      }
    });
  } catch (err) {
    console.error("Question generation error:", err.message);
    res.status(500).json({ error: "Failed to generate questions" });
  }
});

/**
 * Generate single question
 */
router.post("/generate-one", auth, admin, async (req, res) => {
  try {
    const { topic_id, type, difficulty } = req.body;

    if (!topic_id || !type || !difficulty) {
      return res.status(400).json({
        error: "topic_id, type, and difficulty are required"
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OpenAI API key not configured" });
    }

    const topicData = await pool.query(
      "SELECT title FROM topics WHERE id=$1",
      [topic_id]
    );

    if (!topicData.rows.length) {
      return res.status(404).json({ error: "Topic not found" });
    }

    const topic = topicData.rows[0].title;
    const q = await generateQuestion({ topic, type, difficulty });

    const result = await pool.query(
      `INSERT INTO questions(topic_id, type, difficulty, question, options, correct_answer, explanation)
       VALUES($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        topic_id,
        type,
        difficulty,
        q.question,
        JSON.stringify(q.options),
        q.correct_answer,
        q.explanation
      ]
    );

    res.status(201).json({
      message: "Question generated",
      question: result.rows[0]
    });
  } catch (err) {
    console.error("Single question generation error:", err.message);
    res.status(500).json({ error: "Failed to generate question" });
  }
});

/**
 * TEST ROUTE
 */
router.get("/test", (req, res) => {
  res.json({ message: "AI Questions route works ✅" });
});

module.exports = router;
