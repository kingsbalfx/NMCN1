const express = require("express");
const auth = require("../../middleware/auth");
const paid = require("../../middleware/subscription");
const { generateQuestion } = require("../../utils/ai");

const router = express.Router();

/**
 * Generate AI explanation for any question
 */
router.post("/explain", auth, paid, async (req, res) => {
  const { question_text } = req.body;

  const explanation = await generateQuestion({
    topic: "General Nursing", 
    type: "explanation", 
    difficulty: "easy", 
    question: question_text
  });

  res.json(explanation);
});

module.exports = router;
