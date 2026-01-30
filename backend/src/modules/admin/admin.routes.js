const express = require("express");
const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");

const router = express.Router();

/* ✅ SAFE TEST ROUTE */
router.get("/test", (req, res) => {
  res.json({ message: "Admin route works ✅" });
});

/* =======================
   SUBJECTS (DB SAFE)
======================= */
router.post("/subjects", auth, admin, async (req, res) => {
  try {
    const pool = require("../../config/db"); // ⬅ lazy load

    const { name, category } = req.body;
    await pool.query(
      "INSERT INTO subjects(name, category) VALUES($1,$2)",
      [name, category]
    );

    res.json({ message: "Subject added" });
  } catch (err) {
    console.error("DB error:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

/* =======================
   AI COURSE (SAFE)
======================= */
router.post("/generate-course", auth, admin, async (req, res) => {
  try {
    const { OpenAI } = require("openai"); // ⬅ lazy load
    const pool = require("../../config/db");

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OpenAI key missing" });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { category, title } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `Create an NMCN ${category} course titled "${title}" in JSON`
      }],
    });

    const courseJSON = JSON.parse(
      completion.choices[0].message.content
    );

    await pool.query(
      "INSERT INTO courses(title, description, category, modules) VALUES($1,$2,$3,$4)",
      [title, `Full ${category} course`, category, courseJSON.modules]
    );

    res.json({ message: "Course generated", course: courseJSON });
  } catch (err) {
    console.error("AI error:", err.message);
    res.status(500).json({ error: "AI generation failed" });
  }
});

module.exports = router;
