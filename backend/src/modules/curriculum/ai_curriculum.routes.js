const express = require("express");
const pool = require("../../config/db");
const auth = require("../../middleware/auth");
const paid = require("../../middleware/subscription");
const admin = require("../../middleware/admin");
const {
  generateCurriculumQuestion,
  generateStudyPack,
  parseCurriculumText,
  getCurriculumData,
  getAllCurriculumCourses
} = require("../../utils/ai");

const router = express.Router();
const gameSessions = new Map();

let multer = null;
let mammoth = null;
try {
  multer = require("multer");
  mammoth = require("mammoth");
} catch (err) {
  console.warn("Curriculum file upload parsers are not installed:", err.message);
}

const upload = multer ? multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 }
}) : null;

async function getPublishedCurriculum() {
  if (!pool.isDemoMode) {
    try {
      const result = await pool.query(
        `SELECT id, title, version, parsed_content, published_at
         FROM curriculum_uploads
         WHERE status='published'
         ORDER BY published_at DESC NULLS LAST, id DESC
         LIMIT 1`
      );

      if (result.rows.length) {
        return {
          source: "database",
          id: result.rows[0].id,
          title: result.rows[0].title,
          version: result.rows[0].version,
          published_at: result.rows[0].published_at,
          curriculum: result.rows[0].parsed_content
        };
      }
    } catch (dbErr) {
      console.error("Failed to load published curriculum:", dbErr.message);
    }
  }

  return {
    source: "bundled",
    id: null,
    title: "Bundled General Nursing Curriculum",
    version: 1,
    published_at: null,
    curriculum: getCurriculumData()
  };
}

async function extractCurriculumText(file) {
  const name = String(file.originalname || "").toLowerCase();
  const mime = String(file.mimetype || "").toLowerCase();

  if (mime.includes("pdf") || name.endsWith(".pdf")) {
    const pdfParser = require("pdf-parse");
    if (typeof pdfParser === "function") {
      const parsed = await pdfParser(file.buffer);
      return parsed.text || "";
    }
    const parser = new pdfParser.PDFParse({ data: file.buffer });
    const parsed = await parser.getText();
    await parser.destroy();
    return parsed.text || "";
  }

  if (
    mime.includes("wordprocessingml") ||
    mime.includes("msword") ||
    name.endsWith(".docx")
  ) {
    if (!mammoth) throw new Error("DOCX parser is not installed.");
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value || "";
  }

  if (mime.includes("text") || name.endsWith(".txt") || name.endsWith(".md")) {
    return file.buffer.toString("utf8");
  }

  throw new Error("Unsupported curriculum file type. Use PDF, DOCX, or TXT.");
}

/**
 * Generate AI questions based on curriculum topics
 */
router.post("/generate", auth, paid, async (req, res) => {
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
    res.json(getCurriculumData());
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
    const curriculum = getCurriculumData();

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

router.get("/published", async (req, res) => {
  try {
    const published = await getPublishedCurriculum();
    res.json({ success: true, ...published });
  } catch (err) {
    console.error("Published curriculum error:", err);
    res.status(500).json({ error: "Failed to load published curriculum" });
  }
});

router.get("/courses", async (req, res) => {
  try {
    const courses = getAllCurriculumCourses();
    res.json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (err) {
    console.error("Courses list error:", err);
    res.status(500).json({ error: "Failed to fetch curriculum courses" });
  }
});

router.post("/import", auth, admin, async (req, res) => {
  try {
    const { title = "Uploaded Curriculum", curriculum_text } = req.body;

    if (!curriculum_text || curriculum_text.trim().length < 50) {
      return res.status(400).json({ error: "curriculum_text with at least 50 characters is required" });
    }

    const parsed = await parseCurriculumText({ title, curriculum_text });

    let upload = null;
    if (!pool.isDemoMode) {
      try {
        const result = await pool.query(
          "INSERT INTO curriculum_uploads(title, raw_text, parsed_content, status, uploaded_by) VALUES($1,$2,$3,'draft',$4) RETURNING id, title, status, created_at",
          [title, curriculum_text, JSON.stringify(parsed), req.user.id]
        );
        upload = result.rows[0];
      } catch (dbErr) {
        console.error("Failed to save curriculum upload:", dbErr.message);
      }
    }

    res.json({
      success: true,
      message: "Curriculum parsed successfully. Review before publishing.",
      upload,
      parsed,
      publish_note: "Phase 2 stores this as a review preview. Phase 3 can add database-backed publishing/versioning."
    });
  } catch (err) {
    console.error("Curriculum import error:", err);
    res.status(500).json({ error: "Failed to parse curriculum" });
  }
});

router.post("/import-file", auth, admin, upload ? upload.single("curriculum") : (req, res, next) => next(), async (req, res) => {
  try {
    if (!upload) {
      return res.status(501).json({
        error: "Curriculum file upload support is not installed. Run npm install in backend, then retry."
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: "curriculum file is required" });
    }

    const title = req.body.title || req.file.originalname || "Uploaded Curriculum";
    const curriculumText = await extractCurriculumText(req.file);

    if (!curriculumText || curriculumText.trim().length < 50) {
      return res.status(400).json({ error: "Could not extract enough curriculum text from this file" });
    }

    const parsed = await parseCurriculumText({ title, curriculum_text: curriculumText });

    let uploadRecord = null;
    if (!pool.isDemoMode) {
      try {
        const result = await pool.query(
          `INSERT INTO curriculum_uploads(title, raw_text, parsed_content, status, uploaded_by)
           VALUES($1,$2,$3,'draft',$4)
           RETURNING id, title, status, created_at`,
          [title, curriculumText, JSON.stringify(parsed), req.user.id]
        );
        uploadRecord = result.rows[0];
      } catch (dbErr) {
        console.error("Failed to save curriculum file upload:", dbErr.message);
      }
    }

    res.json({
      success: true,
      message: "Curriculum file parsed successfully. Review before publishing.",
      upload: uploadRecord,
      parsed,
      extracted_characters: curriculumText.length
    });
  } catch (err) {
    console.error("Curriculum file import error:", err);
    res.status(500).json({ error: "Failed to parse curriculum file" });
  }
});

router.post("/uploads/:id/publish", auth, admin, async (req, res) => {
  try {
    const { id } = req.params;

    if (pool.isDemoMode) {
      return res.json({
        success: true,
        message: "Curriculum marked as published (demo mode)",
        upload: { id, status: "published", version: 1 }
      });
    }

    const existing = await pool.query("SELECT id, version FROM curriculum_uploads WHERE id=$1", [id]);
    if (!existing.rows.length) {
      return res.status(404).json({ error: "Curriculum upload not found" });
    }

    await pool.query("UPDATE curriculum_uploads SET status='archived', updated_at=NOW() WHERE status='published' AND id<>$1", [id]);

    const result = await pool.query(
      `UPDATE curriculum_uploads
       SET status='published', published_by=$1, published_at=NOW(), updated_at=NOW()
       WHERE id=$2
       RETURNING id, title, version, status, published_at`,
      [req.user.id, id]
    );

    res.json({
      success: true,
      message: "Curriculum published successfully",
      upload: result.rows[0]
    });
  } catch (err) {
    console.error("Curriculum publish error:", err);
    res.status(500).json({ error: "Failed to publish curriculum" });
  }
});

router.get("/offline-bundle", auth, paid, async (req, res) => {
  try {
    const published = await getPublishedCurriculum();
    const bundledCourses = getAllCurriculumCourses(published.curriculum);
    const courseCodes = String(req.query.courseCodes || "")
      .split(",")
      .map((code) => code.trim())
      .filter(Boolean);
    const selectedCourses = courseCodes.length
      ? bundledCourses.filter((course) => courseCodes.includes(course.code))
      : bundledCourses.slice(0, 12);

    let savedPacks = [];
    let tutorMessages = [];
    let latestStudyPlan = null;
    if (!pool.isDemoMode && selectedCourses.length) {
      try {
        const result = await pool.query(
          `SELECT DISTINCT ON (course_code) course_code, title, content, created_at
           FROM study_packs
           WHERE course_code = ANY($1)
           ORDER BY course_code, created_at DESC`,
          [selectedCourses.map((course) => course.code)]
        );
        savedPacks = result.rows.map((row) => ({
          courseCode: row.course_code,
          title: row.title,
          content: row.content,
          created_at: row.created_at
        }));
      } catch (dbErr) {
        console.error("Failed to load saved study packs:", dbErr.message);
      }

      try {
        const tutorResult = await pool.query(
          `SELECT id, course_code, topic, question, response, created_at
           FROM tutor_messages
           WHERE user_id=$1 AND (course_code = ANY($2) OR course_code IS NULL)
           ORDER BY created_at DESC
           LIMIT 20`,
          [req.user.id, selectedCourses.map((course) => course.code)]
        );
        tutorMessages = tutorResult.rows;
      } catch (dbErr) {
        console.error("Failed to load tutor cache:", dbErr.message);
      }

      try {
        const planResult = await pool.query(
          `SELECT plan, created_at
           FROM study_plan_snapshots
           WHERE user_id=$1
           ORDER BY created_at DESC
           LIMIT 1`,
          [req.user.id]
        );
        if (planResult.rows.length) {
          latestStudyPlan = {
            plan: planResult.rows[0].plan,
            created_at: planResult.rows[0].created_at
          };
        }
      } catch (dbErr) {
        console.error("Failed to load study plan cache:", dbErr.message);
      }
    }

    res.json({
      success: true,
      generated_at: new Date().toISOString(),
      curriculum: {
        source: published.source,
        id: published.id,
        title: published.title,
        version: published.version,
        published_at: published.published_at
      },
      courses: selectedCourses,
      study_packs: savedPacks,
      tutor_messages: tutorMessages,
      study_plan: latestStudyPlan,
      offline_rules: {
        cache_lessons: true,
        cache_questions: true,
        cache_tutor_explanations: true,
        cache_study_plan: true,
        sync_progress_when_online: true,
        one_device_only: true
      }
    });
  } catch (err) {
    console.error("Offline bundle error:", err);
    res.status(500).json({ error: "Failed to build offline bundle" });
  }
});

router.get("/study-pack/:courseCode", auth, paid, async (req, res) => {
  try {
    const { courseCode } = req.params;
    const { difficulty = "beginner", refresh = "false" } = req.query;

    if (!pool.isDemoMode && refresh !== "true") {
      try {
        const cached = await pool.query(
          `SELECT content FROM study_packs
           WHERE course_code=$1
           ORDER BY created_at DESC
           LIMIT 1`,
          [courseCode]
        );
        if (cached.rows.length) {
          return res.json({ success: true, pack: cached.rows[0].content, cached: true });
        }
      } catch (dbErr) {
        console.error("Failed to load cached study pack:", dbErr.message);
      }
    }

    const pack = await generateStudyPack({ courseCode, difficulty });
    if (!pool.isDemoMode) {
      try {
        await pool.query(
          "INSERT INTO study_packs(course_code, topic, title, content, ai_generated, created_by) VALUES($1,$2,$3,$4,$5,$6)",
          [pack.courseCode || courseCode, null, pack.title, JSON.stringify(pack), Boolean(pack.aiGenerated), req.user.id]
        );
      } catch (dbErr) {
        console.error("Failed to save study pack:", dbErr.message);
      }
    }
    res.json({ success: true, pack });
  } catch (err) {
    console.error("Study pack error:", err);
    res.status(500).json({ error: "Failed to generate study pack" });
  }
});

router.post("/study-pack", auth, paid, async (req, res) => {
  try {
    const { courseCode, topic, difficulty = "beginner" } = req.body;
    if (!courseCode && !topic) {
      return res.status(400).json({ error: "courseCode or topic is required" });
    }
    const pack = await generateStudyPack({ courseCode, topic, difficulty });
    if (!pool.isDemoMode) {
      try {
        await pool.query(
          "INSERT INTO study_packs(course_code, topic, title, content, ai_generated, created_by) VALUES($1,$2,$3,$4,$5,$6)",
          [pack.courseCode || courseCode || null, topic || null, pack.title, JSON.stringify(pack), Boolean(pack.aiGenerated), req.user.id]
        );
      } catch (dbErr) {
        console.error("Failed to save study pack:", dbErr.message);
      }
    }
    res.json({ success: true, pack });
  } catch (err) {
    console.error("Study pack generation error:", err);
    res.status(500).json({ error: "Failed to generate study pack" });
  }
});

/**
 * Start a curriculum-based quiz game
 */
router.post("/game/start", auth, paid, async (req, res) => {
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
      userId: req.user.id,
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

    gameSessions.set(gameSession.id, gameSession);

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
router.post("/game/answer", auth, paid, async (req, res) => {
  try {
    const { gameId, questionId, answer, timeSpent } = req.body;

    if (!gameId || !questionId || !answer) {
      return res.status(400).json({
        error: "gameId, questionId, and answer are required"
      });
    }

    const session = gameSessions.get(gameId);
    if (!session || session.userId !== req.user.id) {
      return res.status(404).json({ error: "Game session not found" });
    }

    const question = session.questions.find((q) => q.id === questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found in this game" });
    }

    const isCorrect = String(question.correct_answer).toUpperCase() === String(answer).toUpperCase();
    const points = isCorrect ? 10 : 0;
    question.userAnswer = answer;
    question.timeSpent = timeSpent || 0;
    question.correct = isCorrect;
    session.score = session.questions.reduce((sum, q) => sum + (q.correct ? 10 : 0), 0);

    res.json({
      success: true,
      questionId,
      correct: isCorrect,
      points,
      explanation: question.explanation || "Review the lesson summary and try another question.",
      correct_answer: question.correct_answer
    });

  } catch (err) {
    console.error("Answer submission error:", err);
    res.status(500).json({ error: "Failed to submit answer" });
  }
});

/**
 * End game and get final score
 */
router.post("/game/end", auth, paid, async (req, res) => {
  try {
    const { gameId } = req.body;

    if (!gameId) {
      return res.status(400).json({ error: "gameId is required" });
    }

    const session = gameSessions.get(gameId);
    if (!session || session.userId !== req.user.id) {
      return res.status(404).json({ error: "Game session not found" });
    }

    const totalQuestions = session.questions.length;
    const correctAnswers = session.questions.filter((q) => q.correct).length;
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const finalScore = correctAnswers * 10;
    session.completed = true;
    session.endTime = new Date();

    if (!pool.isDemoMode) {
      try {
        await pool.query(
          "INSERT INTO results(user_id, exam_id, score, total, percentage, details, is_passed) VALUES($1,$2,$3,$4,$5,$6,$7)",
          [
            req.user.id,
            session.courseCode || session.topic || "curriculum-game",
            correctAnswers,
            totalQuestions,
            percentage,
            JSON.stringify({
              gameId,
              courseCode: session.courseCode,
              topic: session.topic,
              questions: session.questions.map((q) => ({
                id: q.id,
                question: q.question,
                correct_answer: q.correct_answer,
                userAnswer: q.userAnswer,
                correct: q.correct
              }))
            }),
            percentage >= 50
          ]
        );

        if (session.courseCode) {
          await pool.query(
            `INSERT INTO learning_progress(user_id, course_code, lesson_completed, flashcards_completed,
              quiz_score, quiz_total, xp, streak_count, last_synced_at)
             VALUES($1,$2,$3,$4,$5,$6,$7,$8,NOW())
             ON CONFLICT(user_id, course_code)
             DO UPDATE SET quiz_score=GREATEST(learning_progress.quiz_score,$5),
               quiz_total=GREATEST(learning_progress.quiz_total,$6),
               xp=GREATEST(learning_progress.xp,$7),
               streak_count=GREATEST(learning_progress.streak_count,$8),
               last_synced_at=NOW(), updated_at=NOW()`,
            [
              req.user.id,
              session.courseCode,
              percentage >= 50,
              false,
              correctAnswers,
              totalQuestions,
              finalScore + (percentage >= 50 ? 25 : 5),
              percentage >= 50 ? 1 : 0
            ]
          );
        }
      } catch (dbErr) {
        console.error("Failed to persist curriculum game result:", dbErr.message);
      }
    }

    res.json({
      success: true,
      gameId,
      finalScore,
      totalQuestions,
      correctAnswers,
      percentage,
      passed: percentage >= 50,
      badge: percentage >= 80 ? "Clinical Star" : percentage >= 50 ? "Ward Ready" : "Keep Practicing",
      completed: true,
      message: "Game completed successfully"
    });

  } catch (err) {
    console.error("Game end error:", err);
    res.status(500).json({ error: "Failed to end game" });
  }
});

module.exports = router;
