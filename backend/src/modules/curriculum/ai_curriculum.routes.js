const express = require("express");
const auth = require("../../middleware/auth");
const { generateCurriculumQuestion } = require("../../utils/ai");

const router = express.Router();

/**
 * Generate AI questions based on curriculum topics
 */
router.post("/generate", auth, async (req, res) => {
  try {
    const { courseCode, topic, difficulty = "medium", count = 5, type = "multiple-choice" } = req.body;

    if (!courseCode && !topic) {
      return res.status(400).json({
        error: "Either courseCode or topic is required"
      });
    }

    if (count < 1 || count > 20) {
      return res.status(400).json({ error: "count must be between 1 and 20" });
    }

    const questions = [];

    for (let i = 0; i < count; i++) {
      try {
        const question = await generateCurriculumQuestion({
          courseCode,
          topic,
          difficulty,
          type
        });
        questions.push(question);
      } catch (genErr) {
        console.error(`Failed to generate question ${i + 1}:`, genErr);
        // Continue with other questions
      }
    }

    res.json({
      success: true,
      count: questions.length,
      questions,
      message: `Generated ${questions.length} curriculum-based questions`
    });

  } catch (err) {
    console.error("Curriculum AI generation error:", err);
    res.status(500).json({ error: "Failed to generate questions" });
  }
});

/**
 * Get curriculum structure
 */
router.get("/structure", async (req, res) => {
  try {
    const curriculum = require("../../nursing_questions/curriculum.json");
    res.json(curriculum);
  } catch (err) {
    console.error("Curriculum structure error:", err);
    res.status(500).json({ error: "Failed to load curriculum" });
  }
});

/**
 * Get courses by year/semester
 */
router.get("/courses/:year/:semester", async (req, res) => {
  try {
    const { year, semester } = req.params;
    const curriculum = require("../../nursing_questions/curriculum.json");

    const key = `year${year}_semester${semester}`;
    const courses = curriculum.courses[key] || [];

    res.json({
      year: parseInt(year),
      semester: parseInt(semester),
      courses
    });
  } catch (err) {
    console.error("Courses fetch error:", err);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

/**
 * Start a curriculum-based quiz game
 */
router.post("/game/start", auth, async (req, res) => {
  try {
    const { courseCode, topic, questionCount = 10, timeLimit = 30 } = req.body;

    if (!courseCode && !topic) {
      return res.status(400).json({
        error: "Either courseCode or topic is required"
      });
    }

    // Generate questions for the game
    const questions = [];
    for (let i = 0; i < questionCount; i++) {
      const question = await generateCurriculumQuestion({
        courseCode,
        topic,
        difficulty: "medium",
        type: "multiple-choice"
      });
      questions.push({
        id: `q${i + 1}`,
        ...question,
        userAnswer: null,
        timeSpent: 0
      });
    }

    const gameSession = {
      id: `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      courseCode,
      topic,
      questions,
      currentQuestion: 0,
      score: 0,
      totalQuestions: questionCount,
      timeLimit, // minutes
      startTime: new Date(),
      endTime: null,
      completed: false
    };

    // In a real app, save to database
    // For now, return the session

    res.json({
      success: true,
      game: gameSession,
      message: "Game started successfully"
    });

  } catch (err) {
    console.error("Game start error:", err);
    res.status(500).json({ error: "Failed to start game" });
  }
});

/**
 * Submit answer for game
 */
router.post("/game/answer", auth, async (req, res) => {
  try {
    const { gameId, questionId, answer, timeSpent } = req.body;

    if (!gameId || !questionId || !answer) {
      return res.status(400).json({
        error: "gameId, questionId, and answer are required"
      });
    }

    // In a real app, fetch game from database
    // For now, simulate scoring

    const isCorrect = Math.random() > 0.5; // Mock correctness
    const points = isCorrect ? 10 : 0;

    res.json({
      success: true,
      questionId,
      correct: isCorrect,
      points,
      explanation: "Mock explanation for the answer"
    });

  } catch (err) {
    console.error("Answer submission error:", err);
    res.status(500).json({ error: "Failed to submit answer" });
  }
});

/**
 * End game and get final score
 */
router.post("/game/end", auth, async (req, res) => {
  try {
    const { gameId } = req.body;

    if (!gameId) {
      return res.status(400).json({ error: "gameId is required" });
    }

    // Mock final score
    const finalScore = Math.floor(Math.random() * 100) + 1;
    const totalQuestions = 10;
    const correctAnswers = Math.floor((finalScore / 100) * totalQuestions);

    res.json({
      success: true,
      gameId,
      finalScore,
      totalQuestions,
      correctAnswers,
      percentage: Math.round((correctAnswers / totalQuestions) * 100),
      completed: true,
      message: "Game completed successfully"
    });

  } catch (err) {
    console.error("Game end error:", err);
    res.status(500).json({ error: "Failed to end game" });
  }
});

module.exports = router;