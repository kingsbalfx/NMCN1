const express = require("express");
const pool = require("../../config/db");
const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");

const router = express.Router();

/**
 * GET all topics/subjects
 */
router.get("/topics", auth, async (req, res) => {
  try {
    const topics = await pool.query(
      "SELECT id, title, category, description FROM topics ORDER BY category, title"
    );

    res.json(topics.rows);
  } catch (err) {
    console.error("Topics fetch error:", err);
    res.status(500).json({ error: "Failed to fetch topics" });
  }
});

/**
 * GET topics by category
 */
router.get("/category/:category", auth, async (req, res) => {
  try {
    const { category } = req.params;
    
    const topics = await pool.query(
      "SELECT id, title, category, description FROM topics WHERE category=$1 ORDER BY title",
      [category]
    );

    res.json(topics.rows);
  } catch (err) {
    console.error("Category topics error:", err);
    res.status(500).json({ error: "Failed to fetch category topics" });
  }
});

/**
 * GET single topic
 */
router.get("/:topicId", auth, async (req, res) => {
  try {
    const { topicId } = req.params;
    
    const topic = await pool.query(
      "SELECT id, title, category, description FROM topics WHERE id=$1",
      [topicId]
    );

    if (!topic.rows.length) {
      return res.status(404).json({ error: "Topic not found" });
    }

    res.json(topic.rows[0]);
  } catch (err) {
    console.error("Topic fetch error:", err);
    res.status(500).json({ error: "Failed to fetch topic" });
  }
});

/**
 * CREATE new topic (ADMIN ONLY)
 */
router.post("/", auth, admin, async (req, res) => {
  try {
    const { title, category, description } = req.body;

    if (!title || !category) {
      return res.status(400).json({ error: "title and category are required" });
    }

    const result = await pool.query(
      "INSERT INTO topics(title, category, description) VALUES($1,$2,$3) RETURNING *",
      [title, category, description || null]
    );

    res.json({ message: "Topic created", topic: result.rows[0] });
  } catch (err) {
    console.error("Topic creation error:", err);
    res.status(500).json({ error: "Failed to create topic" });
  }
});

/**
 * TEST ROUTE
 */
router.get("/test", (req, res) => {
  res.json({ message: "Curriculum route works ✅" });
});

module.exports = router;
