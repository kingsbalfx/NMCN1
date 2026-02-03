const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Pool } = require('pg');

async function run() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL not set. Aborting seeder.');
    process.exit(1);
  }

  // sanitize DATABASE_URL credentials (encode password) if needed
  let connString = dbUrl;
  try {
    const schemeIdx = dbUrl.indexOf('//');
    const atIdx = dbUrl.lastIndexOf('@');
    if (schemeIdx !== -1 && atIdx > schemeIdx) {
      const scheme = dbUrl.slice(0, schemeIdx + 2); // e.g. 'postgresql://'
      const creds = dbUrl.slice(schemeIdx + 2, atIdx); // user:pass (may contain colons)
      const rest = dbUrl.slice(atIdx + 1); // host:port/dbname
      const colonIdx = creds.indexOf(':');
      if (colonIdx !== -1) {
        const user = creds.slice(0, colonIdx);
        const pass = creds.slice(colonIdx + 1);
        connString = `${scheme}${user}:${encodeURIComponent(pass)}@${rest}`;
      }
    }
  } catch (e) {
    connString = dbUrl;
  }

  try {
    const u = new URL(connString);
    console.log('Connecting to host:', u.host);
  } catch (e) {
    console.log('Connecting using provided connection string');
  }

  const pool = new Pool({ connectionString: connString, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false });

  // load expanded_questions.json if present, otherwise fallback to nursing_questions loader
  const expandedPath = path.join(__dirname, '..', 'nursing_questions', 'expanded_questions.json');
  let questions = [];
  if (fs.existsSync(expandedPath)) {
    questions = JSON.parse(fs.readFileSync(expandedPath, 'utf8'));
    console.log('Loaded', questions.length, 'questions from expanded_questions.json');
  } else {
    const loaderPath = path.join(__dirname, '..', 'nursing_questions', 'index.js');
    if (fs.existsSync(loaderPath)) {
      const loader = require(loaderPath);
      questions = loader.getQuestions();
      console.log('Loaded', questions.length, 'questions from nursing_questions loader');
    }
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    console.error('No questions available to seed. Create expanded_questions.json or ensure nursing_questions loader returns data.');
    process.exit(1);
  }

  let inserted = 0;
  // detect columns available on topics table
  let topicsColumns = new Set();
  try {
    const colRes = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='topics'");
    for (const r of colRes.rows) topicsColumns.add(r.column_name);
  } catch (e) {
    topicsColumns = new Set(['id','title']);
  }

  // detect columns available on questions table
  let questionsColumns = new Set();
  try {
    const qcolRes = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='questions'");
    for (const r of qcolRes.rows) questionsColumns.add(r.column_name);
  } catch (e) {
    questionsColumns = new Set(['id','topic_id','question','options']);
  }

  try {
    for (const q of questions) {
      const topicTitle = (q.topic || q.subject || 'General').toString().trim();
      const category = (q.subject || 'General').toString().trim();
      // find or create topic
      let topicRes = await pool.query('SELECT id FROM topics WHERE lower(title) = lower($1) LIMIT 1', [topicTitle]);
      let topicId;
      if (topicRes.rows.length > 0) {
        topicId = topicRes.rows[0].id;
      } else {
        // build insert dynamically based on available columns
        const cols = ['title'];
        const vals = [topicTitle];
        const placeholders = ['$1'];
        let idx = 2;
        if (topicsColumns.has('category')) {
          cols.push('category');
          vals.push(category);
          placeholders.push(`$${idx++}`);
        }
        if (topicsColumns.has('description')) {
          cols.push('description');
          vals.push(null);
          placeholders.push(`$${idx++}`);
        }
        const insertQuery = `INSERT INTO topics (${cols.join(',')}) VALUES (${placeholders.join(',')}) RETURNING id`;
        const insertTopic = await pool.query(insertQuery, vals);
        topicId = insertTopic.rows[0].id;
      }

      // check duplicate question
      const existing = await pool.query('SELECT id FROM questions WHERE question = $1 AND topic_id = $2 LIMIT 1', [q.question, topicId]);
      if (existing.rows.length > 0) continue;

      const type = q.type || (q.options ? 'mcq' : 'clinical');
      const difficulty = q.difficulty || 'medium';
      const options = q.options ? JSON.stringify(q.options) : JSON.stringify({});
      const correct = q.correct_answer || null;
      const explanation = q.explanation || null;

      // build dynamic insert for questions table based on available columns
      const qCols = ['topic_id'];
      const qVals = [topicId];
      const qPlaceholders = ['$1'];
      let qIdx = 2;
      if (questionsColumns.has('type')) {
        qCols.push('type'); qVals.push(type); qPlaceholders.push(`$${qIdx++}`);
      }
      if (questionsColumns.has('difficulty')) {
        qCols.push('difficulty'); qVals.push(difficulty); qPlaceholders.push(`$${qIdx++}`);
      }
      if (questionsColumns.has('question')) {
        qCols.push('question'); qVals.push(q.question); qPlaceholders.push(`$${qIdx++}`);
      }
      if (questionsColumns.has('options')) {
        qCols.push('options'); qVals.push(options); qPlaceholders.push(`$${qIdx++}`);
      }
      if (questionsColumns.has('correct_answer')) {
        qCols.push('correct_answer'); qVals.push(correct); qPlaceholders.push(`$${qIdx++}`);
      }
      if (questionsColumns.has('explanation')) {
        qCols.push('explanation'); qVals.push(explanation); qPlaceholders.push(`$${qIdx++}`);
      }
      // attempt to set is_active if available
      if (questionsColumns.has('is_active')) {
        qCols.push('is_active'); qVals.push(true); qPlaceholders.push(`$${qIdx++}`);
      }

      const insertQ = `INSERT INTO questions (${qCols.join(',')}) VALUES (${qPlaceholders.join(',')})`;
      await pool.query(insertQ, qVals);

      inserted++;
    }

    console.log(`Seeder completed. Inserted ${inserted} new questions.`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
