const express = require("express");
const auth = require("../../middleware/auth");
const paid = require("../../middleware/subscription");
const { generateQuestion } = require("../../utils/ai");

const router = express.Router();

/**
 * Generate AI explanation for any question
 */
router.post("/explain", auth, paid, async (req, res) => {
  try {
    const { question_text, topic = "General Nursing", difficulty = "medium" } = req.body;

    if (!question_text) {
      return res.status(400).json({ error: "question_text is required" });
    }

    try {
      const explanation = await generateQuestion({
        topic, 
        type: "explanation", 
        difficulty
      });

      res.json(explanation);
    } catch (aiErr) {
      console.error("AI error:", aiErr.message);
      
      // Fallback explanation
      res.json({
        question: question_text,
        topic,
        difficulty,
        explanation: "An explanation for this question. AI generation temporarily unavailable.",
        sources: ["NMCN Curriculum Guide"],
        aiGenerated: false,
        fallback: true
      });
    }
  } catch (err) {
    console.error("Explanation generation error:", err);
    res.status(500).json({ error: "Failed to generate explanation" });
  }
});

/**
 * TEST ROUTE
 */
router.get("/test", (req, res) => {
  res.json({ 
    message: "Explain route works ✅",
    description: "POST /api/questions/explain - Get AI explanations"
  });
});

module.exports = router;
