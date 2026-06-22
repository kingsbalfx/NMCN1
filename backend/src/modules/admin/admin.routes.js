const express = require("express");
const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const pool = require("../../config/db");
const { OpenAI } = require("openai");

const router = express.Router();

// Base index to avoid 404 on /api/admin
router.get('/', (req, res) => {
  res.json({ message: 'Admin root — endpoints: /subjects, /generate-course, /ai-questions (mounted separately)' });
});

// Demo admin data
const demoSubjects = [
  { id: 1, name: "Anatomy", category: "Fundamentals", description: "Human body structure" },
  { id: 2, name: "Physiology", category: "Fundamentals", description: "Body functions" },
  { id: 3, name: "Pharmacology", category: "Clinical", description: "Drug studies" }
];

const demoCourses = [];

/**
 * TEST ROUTE
 */
router.get("/test", (req, res) => {
  res.json({ 
    message: "Admin route works ✅",
    mode: pool.isDemoMode ? "DEMO" : "DATABASE"
  });
});

/**
 * ADD SUBJECTS (DEMO/DB SAFE)
 */
router.post("/subjects", auth, admin, async (req, res) => {
  try {
    const { name, category, description } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: "name and category are required" });
    }

    // Demo mode
    if (pool.isDemoMode) {
      const newId = Math.max(...demoSubjects.map(s => s.id), 0) + 1;
      const newSubject = { id: newId, name, category, description: description || null };
      demoSubjects.push(newSubject);
      return res.status(201).json({ message: "Subject added (demo mode)", subject: newSubject });
    }

    // Database mode
    try {
      const result = await pool.query(
        "INSERT INTO subjects(name, category, description) VALUES($1, $2, $3) RETURNING *",
        [name, category, description || null]
      );
      res.status(201).json({ message: "Subject added", subject: result.rows[0] });
    } catch (dbErr) {
      console.error("Database error:", dbErr.message);
      res.status(500).json({ error: "Failed to add subject - database error" });
    }
  } catch (err) {
    console.error("Subject creation error:", err.message);
    res.status(500).json({ error: "Failed to add subject" });
  }
});

/**
 * GET all subjects (DEMO/DB SAFE)
 */
router.get("/subjects", auth, admin, async (req, res) => {
  try {
    // Demo mode
    if (pool.isDemoMode) {
      return res.json(demoSubjects);
    }

    // Database mode
    try {
      const subjects = await pool.query(
        "SELECT id, name, category, description FROM subjects ORDER BY category, name"
      );
      res.json(subjects.rows);
    } catch (dbErr) {
      console.error("Database error:", dbErr.message);
      res.status(500).json({ error: "Failed to fetch subjects - database error" });
    }
  } catch (err) {
    console.error("Subjects fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

/**
 * GENERATE AI COURSE
 */
router.post("/generate-course", auth, admin, async (req, res) => {
  try {
    const { category, title, description } = req.body;

    if (!category || !title) {
      return res.status(400).json({ error: "category and title are required" });
    }

    // Demo mode
    if (pool.isDemoMode) {
      const demoCourse = {
        id: demoCourses.length + 1,
        title,
        category,
        description: description || `${category} course`,
        modules: [
          { name: "Introduction", objectives: ["Understand basics"] },
          { name: "Core Concepts", objectives: ["Learn key topics"] },
          { name: "Assessment", objectives: ["Test knowledge"] }
        ],
        aiGenerated: false
      };
      demoCourses.push(demoCourse);
      return res.status(201).json({
        message: "Course generated successfully (demo mode)",
        course: demoCourse,
        aiGenerated: false
      });
    }

    // Real AI generation
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: "OpenAI API key not configured. Running in demo mode.",
        suggestion: "Set OPENAI_API_KEY environment variable"
      });
    }

    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{
          role: "user",
          content: `Create a comprehensive NMCN ${category} course titled "${title}". 
                   ${description ? `Description: ${description}` : ""}
                   Provide structured course content in JSON format with modules and learning objectives.`
        }],
        temperature: 0.7,
        max_tokens: 1000,
      });

      let courseJSON;
      try {
        courseJSON = JSON.parse(completion.choices[0].message.content);
      } catch {
        courseJSON = {
          title,
          category,
          description: description || `${category} course for NMCN`,
          modules: completion.choices[0].message.content
        };
      }

      try {
        const result = await pool.query(
          "INSERT INTO courses(title, description, category, modules) VALUES($1, $2, $3, $4) RETURNING *",
          [title, description || `${category} course`, category, JSON.stringify(courseJSON)]
        );

        return res.status(201).json({
          message: "Course generated successfully",
          course: result.rows[0],
          aiContent: courseJSON
        });
      } catch (dbErr) {
        console.error("Database save error:", dbErr.message);
        res.status(201).json({
          message: "Course generated (not saved to DB)",
          course: courseJSON,
          warning: "Database save failed, but content generated successfully"
        });
      }
    } catch (aiErr) {
      console.error("AI generation error:", aiErr.message);
      res.status(500).json({ error: "AI course generation failed", details: aiErr.message });
    }
  } catch (err) {
    console.error("Course generation error:", err.message);
    res.status(500).json({ error: "Failed to generate course" });
  }
});

/**
 * DELETE subject
 */
router.delete("/subjects/:id", auth, admin, async (req, res) => {
  try {
    const { id } = req.params;

    // Demo mode
    if (pool.isDemoMode) {
      const index = demoSubjects.findIndex(s => s.id === parseInt(id));
      if (index >= 0) {
        demoSubjects.splice(index, 1);
        return res.json({ message: "Subject deleted successfully (demo mode)" });
      }
      return res.status(404).json({ error: "Subject not found" });
    }

    // Database mode
    try {
      await pool.query("DELETE FROM subjects WHERE id=$1", [id]);
      res.json({ message: "Subject deleted successfully" });
    } catch (dbErr) {
      console.error("Database error:", dbErr.message);
      res.status(500).json({ error: "Failed to delete subject - database error" });
    }
  } catch (err) {
    console.error("Subject deletion error:", err.message);
    res.status(500).json({ error: "Failed to delete subject" });
  }
});

/**
 * GET ALL USERS
 */
router.get("/users", auth, admin, async (req, res) => {
  try {
    const users = await pool.query(
      `SELECT id, full_name, username, email, role, has_paid, permanent_access, paid_at,
              payment_reference, device_id, device_name, device_bound_at,
              subscription_expiry, last_login, is_active, created_at
       FROM users ORDER BY created_at DESC`
    );
    res.json(users.rows);
  } catch (err) {
    console.error("Users fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

/**
 * MANUAL GRANT PERMANENT USER ACCESS
 */
router.post("/users/:id/upgrade", auth, admin, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "UPDATE users SET has_paid=true, permanent_access=true, paid_at=COALESCE(paid_at, NOW()), updated_at=NOW() WHERE id=$1",
      [id]
    );

    res.json({ message: "Permanent access granted successfully" });
  } catch (err) {
    console.error("User access grant error:", err.message);
    res.status(500).json({ error: "Failed to upgrade user" });
  }
});

router.post("/users/:id/reset-device", auth, admin, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "UPDATE users SET device_id=NULL, device_name=NULL, device_bound_at=NULL, updated_at=NOW() WHERE id=$1",
      [id]
    );

    res.json({ message: "Device lock reset successfully" });
  } catch (err) {
    console.error("Device reset error:", err.message);
    res.status(500).json({ error: "Failed to reset device" });
  }
});

/**
 * BAN/UNBAN USER
 */
router.post("/users/:id/ban", auth, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const { ban = true } = req.body;

    await pool.query(
      "UPDATE users SET is_active = $1 WHERE id = $2",
      [!ban, id]
    );

    res.json({ message: `User ${ban ? 'banned' : 'unbanned'} successfully` });
  } catch (err) {
    console.error("User ban error:", err.message);
    res.status(500).json({ error: "Failed to ban user" });
  }
});

/**
 * ANALYTICS: REVENUE AND MODULES
 */
router.get("/analytics", auth, admin, async (req, res) => {
  try {
    const revenue = await pool.query(
      "SELECT SUM(amount) as total_revenue FROM payments WHERE status = 'success'"
    );

    const difficultModules = await pool.query(
      "SELECT topic_id, COUNT(*) as attempts, AVG(percentage) as avg_score FROM results GROUP BY topic_id ORDER BY avg_score ASC LIMIT 5"
    );

    res.json({
      totalRevenue: revenue.rows[0].total_revenue || 0,
      difficultModules: difficultModules.rows
    });
  } catch (err) {
    console.error("Analytics error:", err.message);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

router.get("/clinical-logbook", auth, admin, async (req, res) => {
  try {
    if (pool.isDemoMode) {
      return res.json([
        {
          id: 1,
          student_name: "Demo User",
          procedure_name: "Vital signs monitoring",
          category: "Basic Nursing Procedures",
          status: "submitted",
          performed_at: new Date().toISOString().slice(0, 10)
        }
      ]);
    }

    const result = await pool.query(
      `SELECT l.id, u.full_name AS student_name, u.email, l.procedure_name, l.category,
              l.performed_at, l.reflection, l.supervisor_name, l.status, l.created_at
       FROM clinical_logbook_entries l
       JOIN users u ON u.id = l.user_id
       ORDER BY l.created_at DESC
       LIMIT 100`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Clinical logbook fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch clinical logbook entries" });
  }
});

router.post("/clinical-logbook/:id/status", auth, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ["submitted", "approved", "rejected"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "status must be submitted, approved, or rejected" });
    }

    if (pool.isDemoMode) {
      return res.json({ message: `Logbook entry ${status} (demo mode)`, id, status });
    }

    const result = await pool.query(
      "UPDATE clinical_logbook_entries SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING id, status",
      [status, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Logbook entry not found" });
    }

    res.json({ message: "Logbook status updated", entry: result.rows[0] });
  } catch (err) {
    console.error("Clinical logbook status error:", err.message);
    res.status(500).json({ error: "Failed to update logbook status" });
  }
});

module.exports = router;
