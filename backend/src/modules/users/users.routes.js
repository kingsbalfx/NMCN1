const express = require("express");
const pool = require("../../config/db");
const auth = require("../../middleware/auth");
const paid = require("../../middleware/subscription");
const { getAllCurriculumCourses } = require("../../utils/ai");

const router = express.Router();

// Base index to avoid 404 on /api/users
router.get('/', (req, res) => {
  res.json({ message: 'Users root — endpoints: /profile, /exam-history' });
});

/**
 * GET user profile (PROTECTED)
 */
router.get("/profile", auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Try database first
    if (!pool.isDemoMode) {
      try {
        const user = await pool.query(
          "SELECT id, full_name, email, role, has_paid, permanent_access, avatar_gender, avatar_style, subscription_expiry, created_at FROM users WHERE id=$1",
          [userId]
        );

        if (user.rows.length) {
          return res.json(user.rows[0]);
        }
      } catch (dbErr) {
        console.error("Database error, falling back to demo data:", dbErr.message);
      }
    }

    // Demo mode
    res.json({
      id: userId,
      full_name: "Demo User",
      email: "demo@kingsbal.com",
      role: "student",
      has_paid: true,
      permanent_access: true,
      avatar_gender: "female",
      avatar_style: "clinical-hero",
      subscription_expiry: "2025-12-31",
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

/**
 * UPDATE user profile (PROTECTED)
 */
router.put("/profile", auth, async (req, res) => {
  try {
    const { full_name, phone, avatar_gender, avatar_style } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    // Try database first
    if (!pool.isDemoMode) {
      try {
        const result = await pool.query(
          `UPDATE users
           SET full_name=COALESCE($1, full_name),
               phone=COALESCE($2, phone),
               avatar_gender=COALESCE($3, avatar_gender),
               avatar_style=COALESCE($4, avatar_style),
               updated_at=NOW()
           WHERE id=$5
           RETURNING id, full_name, email, phone, role, avatar_gender, avatar_style`,
          [full_name || null, phone || null, avatar_gender || null, avatar_style || null, userId]
        );
        return res.json({ message: "Profile updated", user: result.rows[0] });
      } catch (dbErr) {
        console.error("Database error, falling back to demo response:", dbErr.message);
      }
    }

    // Demo mode
    res.json({ 
      message: "Profile updated (demo mode)", 
      user: { 
        id: userId, 
        full_name: full_name || "Demo User", 
        phone,
        avatar_gender: avatar_gender || "female",
        avatar_style: avatar_style || "clinical-hero"
      } 
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

/**
 * GET user exam history (PROTECTED)
 */
router.get("/exam-history", auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Try database first
    if (!pool.isDemoMode) {
      try {
        const history = await pool.query(
          `SELECT id, exam_id, score, percentage, is_passed AS passed, created_at
           FROM results WHERE user_id=$1 ORDER BY created_at DESC`,
          [userId]
        );
        return res.json(history.rows);
      } catch (dbErr) {
        console.error("Database error, falling back to demo data:", dbErr.message);
      }
    }

    // Demo mode
    res.json([
      {
        id: 1,
        exam_id: "anatomy-001",
        score: 85,
        percentage: 85,
        passed: true,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        exam_id: "pharmacology-001",
        score: 72,
        percentage: 72,
        passed: true,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]);
  } catch (err) {
    console.error("Exam history fetch error:", err);
    res.status(500).json({ error: "Failed to fetch exam history" });
  }
});

router.get("/progress", auth, paid, async (req, res) => {
  try {
    const userId = req.user.id;

    if (!pool.isDemoMode) {
      try {
        const progress = await pool.query(
          `SELECT course_code, lesson_completed, flashcards_completed, quiz_score,
                  quiz_total, xp, streak_count, last_synced_at, updated_at
           FROM learning_progress
           WHERE user_id=$1
           ORDER BY updated_at DESC`,
          [userId]
        );

        const logbook = await pool.query(
          `SELECT id, procedure_name, category, performed_at, patient_condition,
                  reflection, supervisor_name, status, created_at
           FROM clinical_logbook_entries
           WHERE user_id=$1
           ORDER BY created_at DESC
           LIMIT 20`,
          [userId]
        );

        return res.json({
          progress: progress.rows,
          logbook: logbook.rows,
          summary: summarizeProgress(progress.rows, logbook.rows)
        });
      } catch (dbErr) {
        console.error("Progress fetch database error:", dbErr.message);
      }
    }

    const demoProgress = [
      { course_code: "ANA101", lesson_completed: true, flashcards_completed: true, quiz_score: 5, quiz_total: 6, xp: 90, streak_count: 3 },
      { course_code: "FON101", lesson_completed: true, flashcards_completed: false, quiz_score: 3, quiz_total: 6, xp: 45, streak_count: 1 }
    ];
    const demoLogbook = [
      { id: 1, procedure_name: "Vital signs monitoring", category: "Basic Nursing Procedures", status: "approved", performed_at: new Date().toISOString().slice(0, 10) }
    ];

    res.json({
      progress: demoProgress,
      logbook: demoLogbook,
      summary: summarizeProgress(demoProgress, demoLogbook)
    });
  } catch (err) {
    console.error("Progress fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

router.post("/progress/sync", auth, paid, async (req, res) => {
  try {
    const userId = req.user.id;
    const { progress = [], logbook = [] } = req.body;

    if (!Array.isArray(progress) || !Array.isArray(logbook)) {
      return res.status(400).json({ error: "progress and logbook must be arrays" });
    }

    if (pool.isDemoMode) {
      return res.json({
        success: true,
        message: "Progress synced (demo mode)",
        received: { progress: progress.length, logbook: logbook.length }
      });
    }

    for (const item of progress) {
      if (!item.course_code) continue;
      const quizScore = Number(item.quiz_score || 0);
      const quizTotal = Number(item.quiz_total || 0);
      const xp = Number(item.xp || quizScore * 10 + (item.lesson_completed ? 20 : 0) + (item.flashcards_completed ? 10 : 0));

      await pool.query(
        `INSERT INTO learning_progress(user_id, course_code, lesson_completed, flashcards_completed,
          quiz_score, quiz_total, xp, streak_count, last_synced_at)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,NOW())
         ON CONFLICT(user_id, course_code)
         DO UPDATE SET lesson_completed=$3, flashcards_completed=$4, quiz_score=GREATEST(learning_progress.quiz_score,$5),
           quiz_total=GREATEST(learning_progress.quiz_total,$6), xp=GREATEST(learning_progress.xp,$7),
           streak_count=GREATEST(learning_progress.streak_count,$8), last_synced_at=NOW(), updated_at=NOW()`,
        [
          userId,
          item.course_code,
          Boolean(item.lesson_completed),
          Boolean(item.flashcards_completed),
          quizScore,
          quizTotal,
          xp,
          Number(item.streak_count || 0)
        ]
      );
    }

    for (const entry of logbook) {
      if (!entry.procedure_name) continue;
      await pool.query(
        `INSERT INTO clinical_logbook_entries(user_id, procedure_name, category, performed_at,
          patient_condition, reflection, supervisor_name, supervisor_signature, status)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          userId,
          entry.procedure_name,
          entry.category || null,
          entry.performed_at || null,
          entry.patient_condition || null,
          entry.reflection || null,
          entry.supervisor_name || null,
          entry.supervisor_signature || null,
          entry.status || "submitted"
        ]
      );
    }

    res.json({
      success: true,
      message: "Progress synced",
      received: { progress: progress.length, logbook: logbook.length }
    });
  } catch (err) {
    console.error("Progress sync error:", err.message);
    res.status(500).json({ error: "Failed to sync progress" });
  }
});

router.post("/logbook", auth, paid, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      procedure_name,
      category,
      performed_at,
      patient_condition,
      reflection,
      supervisor_name,
      supervisor_signature,
      status = "submitted"
    } = req.body;

    if (!procedure_name) {
      return res.status(400).json({ error: "procedure_name is required" });
    }

    if (pool.isDemoMode) {
      return res.status(201).json({
        message: "Logbook entry saved (demo mode)",
        entry: { id: Date.now(), procedure_name, category, performed_at, status }
      });
    }

    const result = await pool.query(
      `INSERT INTO clinical_logbook_entries(user_id, procedure_name, category, performed_at,
        patient_condition, reflection, supervisor_name, supervisor_signature, status)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id, procedure_name, category, performed_at, status, created_at`,
      [userId, procedure_name, category || null, performed_at || null, patient_condition || null, reflection || null, supervisor_name || null, supervisor_signature || null, status]
    );

    res.status(201).json({ message: "Logbook entry saved", entry: result.rows[0] });
  } catch (err) {
    console.error("Logbook save error:", err.message);
    res.status(500).json({ error: "Failed to save logbook entry" });
  }
});

router.get("/study-plan", auth, paid, async (req, res) => {
  try {
    const userId = req.user.id;
    const courses = getAllCurriculumCourses();

    if (!pool.isDemoMode) {
      try {
        const progressResult = await pool.query(
          `SELECT course_code, lesson_completed, flashcards_completed, quiz_score,
                  quiz_total, xp, streak_count, updated_at
           FROM learning_progress
           WHERE user_id=$1`,
          [userId]
        );

        const results = await pool.query(
          `SELECT score, total, percentage, details, created_at
           FROM results
           WHERE user_id=$1
           ORDER BY created_at DESC
           LIMIT 30`,
          [userId]
        );

        const tutor = await pool.query(
          `SELECT course_code, topic, created_at
           FROM tutor_messages
           WHERE user_id=$1
           ORDER BY created_at DESC
           LIMIT 20`,
          [userId]
        );

        const plan = buildAdaptiveStudyPlan({
          courses,
          progress: progressResult.rows,
          results: results.rows,
          tutorMessages: tutor.rows
        });

        await pool.query(
          `INSERT INTO study_plan_snapshots(user_id, plan_date, plan)
           VALUES($1, CURRENT_DATE, $2)
           ON CONFLICT(user_id, plan_date)
           DO UPDATE SET plan=$2, created_at=NOW()`,
          [userId, JSON.stringify(plan)]
        );

        return res.json({ success: true, plan });
      } catch (dbErr) {
        console.error("Study plan database error:", dbErr.message);
      }
    }

    const demoProgress = [
      { course_code: "ANA101", lesson_completed: true, flashcards_completed: true, quiz_score: 4, quiz_total: 6, xp: 80 },
      { course_code: "FON101", lesson_completed: false, flashcards_completed: false, quiz_score: 2, quiz_total: 6, xp: 25 }
    ];

    res.json({
      success: true,
      plan: buildAdaptiveStudyPlan({
        courses,
        progress: demoProgress,
        results: [],
        tutorMessages: [{ course_code: "FON101", topic: "Patient assessment" }]
      })
    });
  } catch (err) {
    console.error("Study plan error:", err.message);
    res.status(500).json({ error: "Failed to build study plan" });
  }
});

function summarizeProgress(progress, logbook) {
  const totalXp = progress.reduce((sum, item) => sum + Number(item.xp || 0), 0);
  const completedLessons = progress.filter((item) => item.lesson_completed).length;
  const quizAttempts = progress.filter((item) => Number(item.quiz_total || 0) > 0).length;
  const approvedProcedures = logbook.filter((entry) => entry.status === "approved").length;
  const submittedProcedures = logbook.filter((entry) => entry.status === "submitted").length;

  return {
    total_xp: totalXp,
    completed_lessons: completedLessons,
    quiz_attempts: quizAttempts,
    approved_procedures: approvedProcedures,
    submitted_procedures: submittedProcedures,
    rank: totalXp >= 500 ? "Clinical Champion" : totalXp >= 200 ? "Ward Rising Star" : "Student Nurse"
  };
}

function buildAdaptiveStudyPlan({ courses, progress, results, tutorMessages }) {
  const progressByCourse = new Map(progress.map((item) => [item.course_code, item]));
  const tutorFocus = new Map();
  tutorMessages.forEach((message) => {
    const key = message.course_code || "general";
    tutorFocus.set(key, (tutorFocus.get(key) || 0) + 1);
  });

  const rankedCourses = courses.slice(0, 40).map((course, index) => {
    const item = progressByCourse.get(course.code) || {};
    const quizTotal = Number(item.quiz_total || 0);
    const quizScore = Number(item.quiz_score || 0);
    const quizPercent = quizTotal ? Math.round((quizScore / quizTotal) * 100) : 0;
    const completion = [
      item.lesson_completed,
      item.flashcards_completed,
      quizTotal > 0 && quizPercent >= 50
    ].filter(Boolean).length;
    const tutorWeight = tutorFocus.get(course.code) || 0;
    const needsScore = (3 - completion) * 30 + (quizTotal ? Math.max(0, 70 - quizPercent) : 25) + tutorWeight * 10 + index;

    return {
      courseCode: course.code,
      title: course.title,
      semester: course.semester,
      quizPercent,
      xp: Number(item.xp || 0),
      lesson_completed: Boolean(item.lesson_completed),
      flashcards_completed: Boolean(item.flashcards_completed),
      priority: needsScore >= 90 ? "high" : needsScore >= 55 ? "medium" : "steady",
      reason: buildStudyReason({ item, quizTotal, quizPercent, tutorWeight }),
      next_actions: buildNextActions({ course, item, quizTotal, quizPercent }),
      score: needsScore
    };
  }).sort((a, b) => b.score - a.score);

  const weakAreas = rankedCourses.slice(0, 5);
  const averageScore = results.length
    ? Math.round(results.reduce((sum, item) => sum + Number(item.percentage || 0), 0) / results.length)
    : null;

  return {
    generated_at: new Date().toISOString(),
    readiness: buildReadinessLabel(averageScore, progress),
    average_exam_score: averageScore,
    weekly_goal: "Complete 5 lessons, 3 flashcard rounds, 2 quiz missions, and 1 clinical reflection.",
    daily_quests: buildDailyQuests(weakAreas),
    weak_areas: weakAreas,
    suggested_courses: rankedCourses.slice(0, 10),
    rewards: {
      xp_target: 180,
      badge: weakAreas[0]?.priority === "high" ? "Recovery Round" : "Steady Climber"
    },
    offline_ready: true
  };
}

function buildStudyReason({ item, quizTotal, quizPercent, tutorWeight }) {
  if (!item.course_code) return "New course from the curriculum map.";
  if (!item.lesson_completed) return "Lesson is not completed yet.";
  if (!item.flashcards_completed) return "Flashcards still need review.";
  if (quizTotal && quizPercent < 70) return `Quiz score is ${quizPercent}%, so this needs revision.`;
  if (tutorWeight) return "You recently asked the tutor about this area.";
  return "Keep this course warm with spaced revision.";
}

function buildNextActions({ course, item, quizTotal, quizPercent }) {
  const actions = [];
  if (!item.lesson_completed) actions.push({ type: "lesson", label: `Read ${course.title} study pack`, minutes: 20 });
  if (!item.flashcards_completed) actions.push({ type: "flashcards", label: "Complete flashcard recall", minutes: 10 });
  if (!quizTotal || quizPercent < 70) actions.push({ type: "quiz", label: "Take a 10-question mission", minutes: 15 });
  actions.push({ type: "tutor", label: "Ask the AI Tutor for one bedside example", minutes: 5 });
  return actions.slice(0, 4);
}

function buildDailyQuests(weakAreas) {
  const focus = weakAreas[0] || { courseCode: "FON101", title: "Foundation of Nursing" };
  return [
    { id: "quest-lesson", title: "Warm-up Lesson", courseCode: focus.courseCode, task: `Study ${focus.title}`, xp: 30 },
    { id: "quest-recall", title: "Recall Drill", courseCode: focus.courseCode, task: "Answer flashcards without checking notes", xp: 20 },
    { id: "quest-mission", title: "CBT Mission", courseCode: focus.courseCode, task: "Score at least 70% in a short quiz", xp: 50 },
    { id: "quest-clinical", title: "Clinical Reflection", courseCode: focus.courseCode, task: "Write one bedside application in your notes", xp: 25 }
  ];
}

function buildReadinessLabel(averageScore, progress) {
  const completed = progress.filter((item) => item.lesson_completed).length;
  if ((averageScore || 0) >= 80 && completed >= 5) return "Exam Ready";
  if ((averageScore || 0) >= 60 || completed >= 3) return "Building Confidence";
  return "Foundation Builder";
}

/**
 * TEST ROUTE
 */
router.get("/test", (req, res) => {
  res.json({ 
    message: "Users route works ✅",
    features: [
      "GET /api/users/profile - Get user profile (protected)",
      "PUT /api/users/profile - Update profile (protected)",
      "GET /api/users/exam-history - Get exam history (protected)",
      "GET /api/users/progress - Get learning progress",
      "POST /api/users/progress/sync - Sync offline progress",
      "POST /api/users/logbook - Save clinical logbook entry"
    ]
  });
});

module.exports = router;
