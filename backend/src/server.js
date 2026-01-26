require("dotenv").config();
const express = require("express");

const authRoutes = require("./modules/auth/auth.routes");
const questionRoutes = require("./modules/questions/questions.routes");
const examRoutes = require("./modules/exams/exams.routes");
const adminRoutes = require("./modules/admin/admin.routes");

const app = express();
app.use(express.json());

app.get("/api/test", (req, res) => {
  res.json({ message: "API root test works ✅" });
});

app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.status(200).send("Kingsbal API is running 🚀");
});

module.exports = app;
