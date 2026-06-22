const express = require("express");
const pool = require("../../config/db");
const auth = require("../../middleware/auth");
const paid = require("../../middleware/subscription");
const { generateTutorExplanation } = require("../../utils/ai");

const router = express.Router();

async function buildTutorExplanation(req, res) {
  const {
    question_text,
    question,
    courseCode,
    topic = "General Nursing",
    learningLevel = "simple",
    studentAnswer
  } = req.body;
  const prompt = question_text || question;

  if (!prompt) {
    return res.status(400).json({ error: "question_text is required" });
  }

  const explanation = await generateTutorExplanation({
    question: prompt,
    courseCode,
    topic,
    learningLevel,
    studentAnswer
  });

  if (!pool.isDemoMode) {
    try {
      await pool.query(
        `INSERT INTO tutor_messages(user_id, course_code, topic, question, student_answer, response, ai_generated)
         VALUES($1,$2,$3,$4,$5,$6,$7)`,
        [
          req.user.id,
          explanation.courseCode || courseCode || null,
          explanation.topic || topic,
          prompt,
          studentAnswer || null,
          JSON.stringify(explanation),
          Boolean(explanation.aiGenerated)
        ]
      );
    } catch (dbErr) {
      console.error("Tutor history save error:", dbErr.message);
    }
  }

  return res.json({ success: true, explanation });
}

/**
 * Generate a curriculum-grounded AI tutor explanation for any student question.
 */
router.post("/explain", auth, paid, async (req, res) => {
  try {
    return await buildTutorExplanation(req, res);
  } catch (err) {
    console.error("Explanation generation error:", err);
    return res.status(500).json({ error: "Failed to generate explanation" });
  }
});

router.post("/tutor/ask", auth, paid, async (req, res) => {
  try {
    return await buildTutorExplanation(req, res);
  } catch (err) {
    console.error("Tutor ask error:", err);
    return res.status(500).json({ error: "Failed to generate tutor response" });
  }
});

router.get("/tutor/history", auth, paid, async (req, res) => {
  try {
    const { courseCode } = req.query;

    if (pool.isDemoMode) {
      return res.json({
        success: true,
        history: [
          {
            id: "demo-tutor-1",
            course_code: courseCode || "FON101",
            topic: "Foundation of Nursing",
            question: "How do I identify the priority nursing action?",
            response: generateTutorDemoResponse(courseCode),
            created_at: new Date().toISOString()
          }
        ]
      });
    }

    const params = [req.user.id];
    let where = "WHERE user_id=$1";
    if (courseCode) {
      params.push(courseCode);
      where += " AND course_code=$2";
    }

    const result = await pool.query(
      `SELECT id, course_code, topic, question, student_answer, response, ai_generated, created_at
       FROM tutor_messages
       ${where}
       ORDER BY created_at DESC
       LIMIT 30`,
      params
    );

    return res.json({ success: true, history: result.rows });
  } catch (err) {
    console.error("Tutor history error:", err.message);
    return res.status(500).json({ error: "Failed to fetch tutor history" });
  }
});

function generateTutorDemoResponse(courseCode) {
  return {
    courseCode: courseCode || "FON101",
    topic: "Foundation of Nursing",
    answer: "Assess the patient first, then choose the safest action that prevents harm and supports clear documentation.",
    steps: ["Identify the patient problem", "Choose the safety priority", "Document and evaluate"],
    bedside_example: "When vital signs are abnormal, repeat the assessment, report promptly, and document the findings.",
    memory_hook: "Assess first, act safely, document always.",
    image_prompt: "A clear nursing skills-lab illustration about priority nursing assessment.",
    quick_check: {
      question: "What comes before intervention?",
      answer: "Assessment."
    },
    aiGenerated: false,
    offline_ready: true
  };
}

/**
 * TEST ROUTE
 */
router.get("/test", (req, res) => {
  res.json({
    message: "Explain route works",
    description: "POST /api/questions/explain - Get AI tutor explanations"
  });
});

module.exports = router;
