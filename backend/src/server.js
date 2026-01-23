require("dotenv").config();
const express = require("express");

// Routes
const authRoutes = require("./modules/auth/auth.routes");
const questionRoutes = require("./modules/questions/questions.routes");
const examRoutes = require("./modules/exams/exams.routes");
const adminRoutes = require("./modules/admin/admin.routes");
const paymentRoutes = require("./modules/payments/payments.routes");
const aiQuestionsRoutes = require("./modules/admin/ai_questions.routes");

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/ai-questions", aiQuestionsRoutes);
app.use("/api/payments", paymentRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Kingsbal API is running 🚀");
});

// ❌ DO NOT app.listen() on Vercel
// ✅ EXPORT app instead
module.exports = app;
