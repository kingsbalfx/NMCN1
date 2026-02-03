const { Pool } = require("pg");

const isDemoMode = !process.env.DATABASE_URL;

if (isDemoMode) {
  console.warn("⚠️  DATABASE_URL not set. Running in DEMO MODE - API will work with mock data");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://localhost:5432/kingsbal_demo",
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Error handling - don't crash on connection issues in demo mode
pool.on("error", (err) => {
  if (isDemoMode) {
    console.warn("⚠️  Database error (demo mode):", err.message);
  } else {
    console.error("❌ Unexpected error on idle client", err);
  }
});

pool.on("connect", () => {
  console.log("✅ Database connected");
});

// Mock query function for demo mode
pool.isDemoMode = isDemoMode;
pool.mockQuery = async (text, values) => {
  console.log(`📝 Demo mode - simulated query: ${text.substring(0, 50)}...`);
  return { rows: [], rowCount: 0 };
};

module.exports = pool;
