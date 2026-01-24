const express = require("express");

const authRoutes = require("./modules/auth/auth.routes");
const questionRoutes = require("./modules/questions/questions.routes");

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);

app.get("/", (req, res) => {
  res.status(200).send("Kingsbal API is running 🚀");
});

module.exports = app;
