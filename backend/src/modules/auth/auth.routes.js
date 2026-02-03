const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../../config/db");

const router = express.Router();

// Base index to avoid 404 on /api/auth
router.get('/', (req, res) => {
  res.json({ message: 'Auth root — endpoints: POST /register, POST /login, GET /me' });
});

// Demo mode flag
const isDemoMode = pool.isDemoMode;

// Demo users database
const demoUsers = {
  "demo@kingsbal.com": {
    id: 1,
    full_name: "Demo User",
    email: "demo@kingsbal.com",
    password: "password123",
    role: "student"
  },
  "admin@kingsbal.com": {
    id: 2,
    full_name: "Admin User",
    email: "admin@kingsbal.com",
    password: "admin123",
    role: "admin"
  }
};

/**
 * Register
 */
router.post("/register", async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    // Validation
    if (!full_name || !email || !password) {
      return res.status(400).json({ error: "full_name, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Demo mode
    if (isDemoMode) {
      if (demoUsers[email]) {
        return res.status(409).json({ error: "Email already registered (demo mode)" });
      }
      const newId = Math.max(...Object.values(demoUsers).map(u => u.id)) + 1;
      demoUsers[email] = { id: newId, full_name, email, password, role: "student" };
      return res.status(201).json({
        message: "Registered successfully (demo mode)",
        user: { id: newId, full_name, email }
      });
    }

    // Database mode
    try {
      const existing = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
      if (existing.rows.length) {
        return res.status(409).json({ error: "Email already registered" });
      }

      const hash = await bcrypt.hash(password, 10);
      const result = await pool.query(
        "INSERT INTO users(full_name, email, password_hash) VALUES($1, $2, $3) RETURNING id, full_name, email",
        [full_name, email, hash]
      );

      res.status(201).json({ message: "Registered successfully", user: result.rows[0] });
    } catch (dbErr) {
      console.error("Database registration error:", dbErr.message);
      res.status(500).json({ error: "Registration failed - database error" });
    }
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

/**
 * Login
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    // Demo mode
    if (isDemoMode) {
      const user = demoUsers[email];
      if (!user || user.password !== password) {
        return res.status(401).json({ 
          error: "Invalid login credentials (demo mode)",
          hint: "Try demo@kingsbal.com / password123 or admin@kingsbal.com / admin123"
        });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || "demo-secret-key",
        { expiresIn: "7d" }
      );

      return res.json({
        message: "Login successful (demo mode)",
        token,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role
        }
      });
    }

    // Database mode
    try {
      const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);

      if (!user.rows.length) {
        return res.status(401).json({ error: "Invalid login credentials" });
      }

      const match = await bcrypt.compare(password, user.rows[0].password_hash);
      if (!match) {
        return res.status(401).json({ error: "Invalid login credentials" });
      }

      const token = jwt.sign(
        { id: user.rows[0].id, role: user.rows[0].role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.rows[0].id,
          full_name: user.rows[0].full_name,
          email: user.rows[0].email,
          role: user.rows[0].role
        }
      });
    } catch (dbErr) {
      console.error("Database login error:", dbErr.message);
      res.status(500).json({ error: "Login failed - database error" });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

/**
 * Get current user
 */
router.get("/me", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Demo mode
    if (isDemoMode) {
      const user = Object.values(demoUsers).find(u => u.id === userId);
      if (!user) {
        return res.status(404).json({ error: "User not found (demo mode)" });
      }
      return res.json({ user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role } });
    }

    // Database mode
    try {
      const user = await pool.query("SELECT id, full_name, email, role FROM users WHERE id=$1", [userId]);
      if (!user.rows.length) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ user: user.rows[0] });
    } catch (dbErr) {
      console.error("Database error:", dbErr.message);
      res.status(500).json({ error: "Failed to fetch user - database error" });
    }
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

/**
 * TEST ROUTE
 */
router.get("/test", (req, res) => {
  res.json({ 
    message: "Auth route works ✅",
    mode: isDemoMode ? "DEMO" : "DATABASE",
    testCredentials: isDemoMode ? {
      student: { email: "demo@kingsbal.com", password: "password123" },
      admin: { email: "admin@kingsbal.com", password: "admin123" }
    } : "Not available in database mode"
  });
});

module.exports = router;
