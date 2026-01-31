const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

async function importFile(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath));

  for (const q of data) {
    await pool.query(
      `INSERT INTO questions
      (program, subject, topic, type, difficulty, question, options, correct_answer, explanation)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        q.program,
        q.subject,
        q.topic,
        q.type,
        q.difficulty,
        q.question,
        q.options || null,
        q.correct_answer || null,
        q.ai_explanation
      ]
    );
  }
}

async function run() {
  const dir = path.join(__dirname, "../nursing_questions");
  const files = fs.readdirSync(dir);

  for (const file of files) {
    await importFile(path.join(dir, file));
    console.log(`✅ Imported ${file}`);
  }

  console.log("🎉 All nursing questions imported successfully");
  process.exit();
}

run();
