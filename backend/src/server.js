require("dotenv").config();
const express = require("express");

const authRoutes = require("./modules/auth/auth.routes");
const questionRoutes = require("./modules/questions/questions.routes");
const examRoutes = require("./modules/exams/exams.routes");
const adminRoutes = require("./modules/admin/admin.routes");
const paymentRoutes = require("./modules/payments/payments.routes");
const aiQuestionsRoutes = require("./modules/admin/ai_questions.routes");

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin/ai-questions", aiQuestionsRoutes);

app.get("/", (req, res) => {
  res.send("Kingsbal API is running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
