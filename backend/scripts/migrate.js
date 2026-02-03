const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function run() {
  const sqlPath = path.join(__dirname, '..', 'DATABASE_SCHEMA.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('DATABASE_SCHEMA.sql not found in project root');
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set. Aborting migration.');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false });

  try {
    console.log('Running migrations...');
    await pool.query(sql);
    console.log('Migrations completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
