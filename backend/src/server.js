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

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Kingsbal API is running 🚀", status: "healthy" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/questions", explainRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/ai-questions", adminAIQuestionsRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/curriculum", curriculumRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app; // ❗ NO listen() - handled by api/index.js
