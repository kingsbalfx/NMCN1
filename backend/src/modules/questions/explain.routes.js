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

    const explanation = await generateQuestion({
      topic, 
      type: "explanation", 
      difficulty
    });

    res.json(explanation);
  } catch (err) {
    console.error("Explanation generation error:", err);
    res.status(500).json({ error: "Failed to generate explanation" });
  }
});

module.exports = router;
