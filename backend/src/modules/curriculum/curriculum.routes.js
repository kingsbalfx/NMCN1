const express = require("express");
const pool = require("../../config/db");
const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");

const router = express.Router();

// Base index to avoid 404 on /api/curriculum
router.get('/', (req, res) => {
  res.json({ message: 'Curriculum root — endpoints: /topics, /category/:category, /:topicId' });
});

// Demo curriculum data
const demoTopics = [
  { id: 1, title: "Anatomy and Physiology", category: "Fundamentals", description: "Study of body structure and function" },
  { id: 2, title: "Pharmacology", category: "Fundamentals", description: "Study of drugs and their effects" },
  { id: 3, title: "Medical-Surgical Nursing", category: "Clinical", description: "Care of surgical and medical patients" },
  { id: 4, title: "Pediatric Nursing", category: "Clinical", description: "Care of children and adolescents" },
  { id: 5, title: "Mental Health Nursing", category: "Clinical", description: "Psychiatric and mental health care" },
  { id: 6, title: "Community Health", category: "Community", description: "Public health and community nursing" },
  { id: 7, title: "Reproductive Health", category: "Maternal-Child", description: "Obstetrics and gynecology nursing" },
  { id: 8, title: "Research Methods", category: "Advanced", description: "Nursing research methodology" }
];

/**
 * GET all topics/subjects (PUBLIC)
 */
router.get("/topics", async (req, res) => {
  try {
    // Try database first
    if (!pool.isDemoMode) {
      try {
        const topics = await pool.query(
          "SELECT id, title, category, description FROM topics ORDER BY category, title"
        );
        return res.json(topics.rows);
      } catch (dbErr) {
        console.error("Database error, falling back to demo data:", dbErr.message);
      }
    }

    // Demo mode
    res.json(demoTopics);
  } catch (err) {
    console.error("Topics fetch error:", err);
    res.status(500).json({ error: "Failed to fetch topics" });
  }
});

/**
 * GET topics by category (PUBLIC)
 */
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    
    // Try database first
    if (!pool.isDemoMode) {
      try {
        const topics = await pool.query(
          "SELECT id, title, category, description FROM topics WHERE category=$1 ORDER BY title",
          [category]
        );
        return res.json(topics.rows);
      } catch (dbErr) {
        console.error("Database error, falling back to demo data:", dbErr.message);
      }
    }

    // Demo mode
    const filtered = demoTopics.filter(t => t.category.toLowerCase() === category.toLowerCase());
    res.json(filtered.length > 0 ? filtered : demoTopics);
  } catch (err) {
    console.error("Category topics error:", err);
    res.status(500).json({ error: "Failed to fetch category topics" });
  }
});

/**
 * GET single topic (PUBLIC)
 */
router.get("/:topicId", async (req, res) => {
  try {
    const { topicId } = req.params;
    
    // Try database first
    if (!pool.isDemoMode) {
      try {
        const topic = await pool.query(
          "SELECT id, title, category, description FROM topics WHERE id=$1",
          [topicId]
        );
        if (topic.rows.length) {
          return res.json(topic.rows[0]);
        }
      } catch (dbErr) {
        console.error("Database error, falling back to demo data:", dbErr.message);
      }
    }

    // Demo mode
    const topic = demoTopics.find(t => t.id === parseInt(topicId));
    if (!topic) {
      return res.status(404).json({ error: "Topic not found" });
    }
    res.json(topic);
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
