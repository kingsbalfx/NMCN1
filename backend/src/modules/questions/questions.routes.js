const express = require("express");
const pool = require("../../config/db");
const auth = require("../../middleware/auth");
const paid = require("../../middleware/subscription");
const nursingQuestionsBank = require("../../../nursing_questions");

const router = express.Router();

// Base index to avoid 404 on /api/questions
router.get('/', (req, res) => {
  res.json({
    message: 'Questions root — available endpoints: /all, /topic/:topicId, /:topicId (protected)',
    routes: ['/all', '/topic/:topicId', '/:topicId (protected)']
  });
});

/**
 * TEST ROUTE (PUBLIC)
 * https://your-domain/api/questions/test
 */
router.get("/test", (req, res) => {
  res.json({ 
    message: "Questions route works ✅",
    status: "operational",
    questionsAvailable: nursingQuestionsBank.getCount ? nursingQuestionsBank.getCount() : "unknown"
  });
});

/**
 * GET ALL QUESTIONS (PUBLIC - DEMO)
 * https://your-domain/api/questions/all
 */
router.get("/all", (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const questions = nursingQuestionsBank.getQuestions().slice(0, limit);
    
    res.json({
      success: true,
      count: questions.length,
      questions,
      message: "Questions retrieved successfully"
    });
  } catch (err) {
    console.error("Error fetching all questions:", err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

/**
 * GET QUESTIONS BY TOPIC (PUBLIC - DEMO)
 * https://your-domain/api/questions/topic/:topicId
 */
router.get("/topic/:topicId", (req, res) => {
  try {
    const { topicId } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    
    let questions = [];
    
    // Try database first if available
    if (!pool.isDemoMode) {
      // Database mode would go here
      // For now, use nursing questions bank
    }
    
    // Use nursing questions bank
    questions = nursingQuestionsBank.getQuestionsByTopic(topicId).slice(0, limit);
    
    if (!questions.length) {
      questions = nursingQuestionsBank.getRandomQuestions(limit);
    }
    
    res.json({
      success: true,
      topic: topicId,
      count: questions.length,
      questions,
      message: "Questions retrieved successfully"
    });
  } catch (err) {
    console.error("Error fetching topic questions:", err);
    res.status(500).json({ error: "Failed to fetch questions for topic" });
  }
});

/**
 * REAL QUESTIONS ROUTE (PROTECTED)
 * https://your-domain/api/questions/:topicId
 */
router.get("/:topicId", auth, paid, async (req, res) => {
  try {
    const { topicId } = req.params;

    // Try database first if available
    if (!pool.isDemoMode) {
      try {
        const questions = await pool.query(
          "SELECT * FROM questions WHERE topic_id = $1 ORDER BY difficulty",
          [topicId]
        );
        return res.json(questions.rows);
      } catch (dbErr) {
        console.error("Database query failed, falling back to nursing questions:", dbErr.message);
      }
    }

    // Fallback to nursing questions bank
    const questions = nursingQuestionsBank.getQuestionsByTopic(topicId);
    
    if (!questions.length) {
      return res.status(404).json({ 
        error: "No questions found for this topic",
        suggestions: "Try /api/questions/all for all available questions"
      });
    }

    res.json(questions);
  } catch (err) {
    console.error("Error fetching questions:", err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

module.exports = router;
