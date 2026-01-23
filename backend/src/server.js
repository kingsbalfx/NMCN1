require("dotenv").config();
const express = require("express");

const authRoutes = require("./modules/auth/auth.routes");
// ⛔ TEMPORARILY DISABLE THESE
// const questionRoutes = require("./modules/questions/questions.routes");
// const examRoutes = require("./modules/exams/exams.routes");
// const adminRoutes = require("./modules/admin/admin.routes");
// const paymentRoutes = require("./modules/payments/payments.routes");
// const aiQuestionsRoutes = require("./modules/admin/ai_questions.routes");

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.status(200).send("Kingsbal API is running 🚀");
});

module.exports = app;
