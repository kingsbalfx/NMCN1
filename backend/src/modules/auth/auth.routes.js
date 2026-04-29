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
    username: "kingsbalfx",
    email: "demo@kingsbal.com",
    password: "password123",
    role: "student"
  },
  "admin@kingsbal.com": {
    id: 2,
    full_name: "Admin User",
    username: "admin",
    email: "admin@kingsbal.com",
    password: "014/Pt/014",
    role: "admin"
  }
};

// Cookie options for login token
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

/**
 * Register
 */
router.post("/register", async (req, res) => {
  try {
    const { full_name, username, email, password } = req.body;

    // Validation
    if (!full_name || !username || !email || !password) {
      return res.status(400).json({ error: "full_name, username, email, and password are required" });
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
      demoUsers[email] = { id: newId, full_name, username, email, password, role: "student" };
      return res.status(201).json({
        message: "Registered successfully (demo mode)",
        user: { id: newId, full_name, username, email }
      });
    }

    // Database mode
    try {
      const existing = await pool.query("SELECT id FROM users WHERE email=$1 OR username=$2", [email, username]);
      if (existing.rows.length) {
        return res.status(409).json({ error: "Email or username already registered" });
      }

      const hash = await bcrypt.hash(password, 10);
      const result = await pool.query(
        "INSERT INTO users(full_name, username, email, password_hash) VALUES($1, $2, $3, $4) RETURNING id, full_name, username, email",
        [full_name, username, email, hash]
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
 * Login (supports username or email)
 */
router.post("/login", async (req, res) => {
  try {
    const { username_or_email, password } = req.body;

    if (!username_or_email || !password) {
      return res.status(400).json({ error: "username_or_email and password are required" });
    }

    // Demo mode
    if (isDemoMode) {
      let user = Object.values(demoUsers).find(u => u.email === username_or_email || u.username === username_or_email);
      if (!user || user.password !== password) {
        return res.status(401).json({ 
          error: "Invalid login credentials (demo mode)",
          hint: "Try username:kingsbalfx/password:password123 or admin/014Pt014"
        });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || "demo-secret-key",
        { expiresIn: "7d" }
      );

      res.cookie("token", token, cookieOptions);

      return res.json({
        message: "Login successful (demo mode)",
        token,
        user: {
          id: user.id,
          full_name: user.full_name,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    }

    // Database mode
    try {
      const user = await pool.query("SELECT * FROM users WHERE email=$1 OR username=$2", [username_or_email, username_or_email]);

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

      res.cookie("token", token, cookieOptions);

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.rows[0].id,
          full_name: user.rows[0].full_name,
          username: user.rows[0].username,
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
/**
 * Forgot Password - Generate reset token
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Demo mode - simulate email sending
    if (isDemoMode) {
      const user = Object.values(demoUsers).find(u => u.email === email);
      if (!user) {
        // Don't reveal if email exists (security best practice)
        return res.json({ message: "If email exists, password reset link has been sent" });
      }

      // Generate reset token (expires in 15 minutes)
      const resetToken = jwt.sign(
        { id: user.id, type: "password-reset" },
        process.env.JWT_SECRET || "demo-secret-key",
        { expiresIn: "15m" }
      );

      console.log(`[Demo] Password reset token for ${email}: ${resetToken}`);
      console.log(`[Demo] Reset URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`);

      return res.json({ 
        message: "If email exists, password reset link has been sent",
        demo_token: resetToken // Only in demo mode
      });
    }

    // Database mode
    try {
      const user = await pool.query("SELECT id FROM users WHERE email=$1", [email]);

      if (!user.rows.length) {
        return res.json({ message: "If email exists, password reset link has been sent" });
      }

      const resetToken = jwt.sign(
        { id: user.rows[0].id, type: "password-reset" },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      // TODO: Send email with reset link (use nodemailer or SendGrid)
      // const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      // await sendEmail(email, "Password Reset", `Click here to reset: ${resetLink}`);

      return res.json({ message: "If email exists, password reset link has been sent" });
    } catch (dbErr) {
      console.error("Database forgot-password error:", dbErr.message);
      res.status(500).json({ error: "Request failed" });
    }
  } catch (err) {
    console.error("Forgot-password error:", err);
    res.status(500).json({ error: "Request failed" });
  }
});

/**
 * Reset Password - Apply new password with token
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "demo-secret-key");
      if (decoded.type !== "password-reset") {
        return res.status(401).json({ error: "Invalid token" });
      }
    } catch (err) {
      return res.status(401).json({ error: "Token expired or invalid" });
    }

    // Demo mode
    if (isDemoMode) {
      const user = Object.values(demoUsers).find(u => u.id === decoded.id);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      // Update demo user password
      user.password = newPassword;

      return res.json({ 
        message: "Password reset successful (demo mode)",
        user: {
          id: user.id,
          full_name: user.full_name,
          username: user.username,
          email: user.email
        }
      });
    }

    // Database mode
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const user = await pool.query(
        "UPDATE users SET password_hash=$1, updated_at=NOW() WHERE id=$2 RETURNING id, full_name, username, email",
        [hashedPassword, decoded.id]
      );

      if (!user.rows.length) {
        return res.status(401).json({ error: "User not found" });
      }

      return res.json({ 
        message: "Password reset successful",
        user: user.rows[0]
      });
    } catch (dbErr) {
      console.error("Database reset-password error:", dbErr.message);
      res.status(500).json({ error: "Password reset failed" });
    }
  } catch (err) {
    console.error("Reset-password error:", err);
    res.status(500).json({ error: "Password reset failed" });
  }
});

module.exports = router;
