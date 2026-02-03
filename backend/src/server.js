const express = require("express");

// Route imports
const authRoutes = require("./modules/auth/auth.routes");
const questionRoutes = require("./modules/questions/questions.routes");
const explainRoutes = require("./modules/questions/explain.routes");
const examRoutes = require("./modules/exams/exams.routes");
const adminRoutes = require("./modules/admin/admin.routes");
const adminAIQuestionsRoutes = require("./modules/admin/ai_questions.routes");
const paymentsRoutes = require("./modules/payments/payments.routes");
const usersRoutes = require("./modules/users/users.routes");
const curriculumRoutes = require("./modules/curriculum/curriculum.routes");

// Middleware
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Case-insensitive path middleware - normalize to lowercase for matching
app.use((req, res, next) => {
  req.originalPath = req.path;
  if (req.path !== req.path.toLowerCase() && !req.path.includes('.')) {
    return res.redirect(301, req.path.toLowerCase());
  }
  next();
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ===== PUBLIC HEALTH CHECK ROUTES =====
// Health check route - always works
app.get("/", (req, res) => {
  res.status(200).json({ 
    message: "Kingsbal API is running 🚀", 
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// Health endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "healthy",
    service: "Kingsbal API",
    timestamp: new Date().toISOString()
  });
});

// API Status
app.get("/api/status", (req, res) => {
  res.status(200).json({ 
    message: "Kingsbal API is running 🚀", 
    status: "healthy",
    environment: process.env.NODE_ENV || "production"
  });
});

// ===== PUBLIC NURSING QUESTIONS ENDPOINT =====
const nursingQuestionsBank = require("../nursing_questions/index");

app.get("/api/public/nursing-questions", (req, res) => {
  try {
    const { topic, limit = 10 } = req.query;
    
    let questions = nursingQuestionsBank.getQuestions();
    
    if (topic && nursingQuestionsBank.getQuestionsByTopic) {
      questions = nursingQuestionsBank.getQuestionsByTopic(topic);
    }
    
    const limited = questions.slice(0, Math.min(limit, 100));
    
    res.status(200).json({
      success: true,
      count: limited.length,
      questions: limited,
      message: "Nursing questions retrieved successfully"
    });
  } catch (err) {
    console.error("Error fetching nursing questions:", err);
    res.status(500).json({ error: "Failed to fetch nursing questions" });
  }
});

// ===== DIRECT ROUTE TESTS (to verify routing works) =====
app.get("/test", (req, res) => {
  res.json({ message: "Root /test endpoint works ✅", status: "online" });
});

app.get("/questions/test", (req, res) => {
  res.json({ message: "Questions test endpoint works ✅" });
});

app.get("/exams/test", (req, res) => {
  res.json({ message: "Exams test endpoint works ✅" });
});

app.get("/admin/test", (req, res) => {
  res.json({ message: "Admin test endpoint works ✅" });
});

app.get("/payments/test", (req, res) => {
  res.json({ message: "Payments test endpoint works ✅" });
});

app.get("/users/test", (req, res) => {
  res.json({ message: "Users test endpoint works ✅" });
});

app.get("/curriculum/test", (req, res) => {
  res.json({ message: "Curriculum test endpoint works ✅" });
});

// ===== PROTECTED API ROUTES =====
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/questions", explainRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/ai-questions", adminAIQuestionsRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/curriculum", curriculumRoutes);

// Helpful API root and aliases to reduce 404s from legacy clients or typos
app.get('/api', (req, res) => {
  res.json({
    message: 'Kingsbal API — available base routes',
    routes: [
      '/api/auth', '/api/questions', '/api/exams', '/api/admin', '/api/payments', '/api/users', '/api/curriculum', '/api/public/nursing-questions'
    ]
  });
});

// Redirect /api/modules/* -> /api/* (legacy clients)
app.use('/api/modules', (req, res) => {
  const target = req.originalUrl.replace('/api/modules', '/api');
  return res.redirect(301, target);
});

// Mount explain routes also at /api/explains for common pluralization
app.use('/api/explains', explainRoutes);

// Mount ai admin routes at /api/ai_questions as alias
app.use('/api/ai_questions', adminAIQuestionsRoutes);

// Also mount top-level routes for backward compatibility (no /api prefix)
app.use("/auth", authRoutes);
app.use("/questions", questionRoutes);
app.use("/questions", explainRoutes);
app.use("/exams", examRoutes);
app.use("/admin", adminRoutes);
app.use("/admin/ai-questions", adminAIQuestionsRoutes);
app.use("/payments", paymentsRoutes);
app.use("/users", usersRoutes);
app.use("/curriculum", curriculumRoutes);
// ===== 404 HANDLER =====
app.use((req, res) => {
  console.warn(`⚠️  404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: "Route not found",
    path: req.path,
    method: req.method,
    message: "Check API documentation at /api/docs"
  });
});

// ===== GLOBAL ERROR HANDLER (must be last) =====
app.use(errorHandler);

module.exports = app; // ❗ NO listen() - handled by api/index.js
