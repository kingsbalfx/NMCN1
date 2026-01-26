const express = require("express");
const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const { OpenAI } = require("openai");

const router = express.Router();

/* =======================
   OPENAI (SAFE)
======================= */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* =======================
   ✅ ADMIN TEST ROUTE
   (NO DB, NO AUTH)
======================= */
router.get("/test", (req, res) => {
  res.json({ message: "Admin route works ✅" });
});

/* =======================
   SUBJECTS
======================= */
router.post("/subjects", auth, admin, async (req, res) => {
  try {
    const pool = require("../../config/db");

    const { name, category } = req.body;

    await pool.query(
      "INSERT INTO subjects(name, category) VALUES($1, $2)",
      [name, category]
    );

    res.json({ message: "Subject added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/subjects", auth, admin, async (req, res) => {
  try {
    const pool = require("../../config/db");

    const data = await pool.query("SELECT * FROM subjects");
    res.json(data.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

/* =======================
   TOPICS
======================= */
router.post("/topics", auth, admin, async (req, res) => {
  try {
    const pool = require("../../config/db");

    const { subject_id, title } = req.body;

    await pool.query(
      "INSERT INTO topics(subject_id, title) VALUES($1, $2)",
      [subject_id, title]
    );

    res.json({ message: "Topic added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

/* =======================
   QUESTIONS (MANUAL)
======================= */
router.post("/questions", auth, admin, async (req, res) => {
  try {
    const pool = require("../../config/db");

    const {
      topic_id,
      type,
      difficulty,
      question,
      options,
      correct_answer,
      explanation,
    } = req.body;

    await pool.query(
      `
      INSERT INTO questions
      (topic_id, type, difficulty, question, options, correct_answer, explanation)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      `,
      [
        topic_id,
        type,
        difficulty,
        question,
        options || null,
        correct_answer || null,
        explanation,
      ]
    );

    res.json({ message: "Question added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

/* =======================
   AI: GENERATE FULL COURSE
======================= */
router.post("/generate-course", auth, admin, async (req, res) => {
  try {
    const pool = require("../../config/db");

    const { category, title } = req.body;

    const prompt = `
Create a complete NMCN-compliant ${category} course titled "${title}".
Respond strictly in JSON:
{
  "modules": [
    {
      "title": "Module 1",
      "lessons": ["Lesson 1", "Lesson 2"]
    }
  ]
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const courseJSON = JSON.parse(
      completion.choices[0].message.content.trim()
    );

    await pool.query(
      `
      INSERT INTO courses(title, description, category, modules)
      VALUES ($1,$2,$3,$4)
      `,
      [title, `Full ${category} course`, category, courseJSON.modules]
    );

    res.json({
      message: "Course generated successfully",
      course: courseJSON,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI course generation failed" });
  }
});

/* =======================
   USERS
======================= */
router.get("/users", auth, admin, async (req, res) => {
  try {
    const pool = require("../../config/db");

    const users = await pool.query(
      "SELECT id, full_name, email, role, subscription_expiry FROM users"
    );

    res.json(users.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
