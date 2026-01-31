const express = require("express");
const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const { OpenAI } = require("openai");

const router = express.Router();

/**
 * TEST ROUTE
 */
router.get("/test", (req, res) => {
  res.json({ message: "Admin route works ✅" });
});

/**
 * ADD SUBJECTS (DB SAFE)
 */
router.post("/subjects", auth, admin, async (req, res) => {
  try {
    const pool = require("../../config/db");
    const { name, category, description } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: "name and category are required" });
    }

    const result = await pool.query(
      "INSERT INTO subjects(name, category, description) VALUES($1, $2, $3) RETURNING *",
      [name, category, description || null]
    );

    res.status(201).json({ message: "Subject added", subject: result.rows[0] });
  } catch (err) {
    console.error("Subject creation error:", err.message);
    res.status(500).json({ error: "Failed to add subject" });
  }
});

/**
 * GET all subjects
 */
router.get("/subjects", auth, admin, async (req, res) => {
  try {
    const pool = require("../../config/db");
    
    const subjects = await pool.query(
      "SELECT id, name, category, description FROM subjects ORDER BY category, name"
    );

    res.json(subjects.rows);
  } catch (err) {
    console.error("Subjects fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

/**
 * GENERATE AI COURSE
 */
router.post("/generate-course", auth, admin, async (req, res) => {
  try {
    const pool = require("../../config/db");

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OpenAI API key is not configured" });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { category, title, description } = req.body;

    if (!category || !title) {
      return res.status(400).json({ error: "category and title are required" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `Create a comprehensive NMCN ${category} course titled "${title}". 
                 ${description ? `Description: ${description}` : ""}
                 Provide structured course content in JSON format with modules and learning objectives.`
      }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    let courseJSON;
    try {
      courseJSON = JSON.parse(completion.choices[0].message.content);
    } catch {
      courseJSON = {
        title,
        category,
        description: description || `${category} course for NMCN`,
        modules: completion.choices[0].message.content
      };
    }

    const result = await pool.query(
      "INSERT INTO courses(title, description, category, modules) VALUES($1, $2, $3, $4) RETURNING *",
      [title, description || `${category} course`, category, JSON.stringify(courseJSON)]
    );

    res.status(201).json({
      message: "Course generated successfully",
      course: result.rows[0],
      aiContent: courseJSON
    });
  } catch (err) {
    console.error("AI course generation error:", err.message);
    res.status(500).json({ error: "Failed to generate course" });
  }
});

/**
 * DELETE subject
 */
router.delete("/subjects/:id", auth, admin, async (req, res) => {
  try {
    const pool = require("../../config/db");
    const { id } = req.params;

    await pool.query("DELETE FROM subjects WHERE id=$1", [id]);

    res.json({ message: "Subject deleted successfully" });
  } catch (err) {
    console.error("Subject deletion error:", err.message);
    res.status(500).json({ error: "Failed to delete subject" });
  }
});

module.exports = router;
