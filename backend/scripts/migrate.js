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

  // Sanitize DATABASE_URL if password contains special characters
  let connString = process.env.DATABASE_URL;
  try {
    const schemeIdx = connString.indexOf('//');
    const atIdx = connString.lastIndexOf('@');
    if (schemeIdx !== -1 && atIdx > schemeIdx) {
      const scheme = connString.slice(0, schemeIdx + 2);
      const creds = connString.slice(schemeIdx + 2, atIdx);
      const rest = connString.slice(atIdx + 1);
      const colonIdx = creds.indexOf(':');
      if (colonIdx !== -1) {
        const user = creds.slice(0, colonIdx);
        const pass = creds.slice(colonIdx + 1);
        connString = `${scheme}${user}:${encodeURIComponent(pass)}@${rest}`;
      }
    }
  } catch (e) {
    // Use original connection string if encoding fails
  }

  const pool = new Pool({
    connectionString: connString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔄 Running migrations...');
    await pool.query(sql);
    console.log('✅ Migrations completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
