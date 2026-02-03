require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const app = require("../src/server");
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

// Listen in local development, or if DATABASE_URL is set (for local testing with real DB/API)
// Only skip listening on Vercel serverless
if (!process.env.VERCEL && (process.env.NODE_ENV !== "production" || process.env.DATABASE_URL)) {
  app.listen(PORT, HOST, () => {
    console.log(`✅ Server running on http://${HOST}:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🔌 Database: ${process.env.DATABASE_URL ? "Connected to Supabase" : "Not configured"}`);
    console.log(`🤖 AI: ${process.env.OPENAI_API_KEY ? "Enabled (OpenAI)" : "Disabled (mock fallback)"}`);
  });
} else {
  console.log(`🚀 Kingsbal API initialized (${process.env.NODE_ENV || "production"} mode)`);
}

// Export app for Vercel/Serverless
module.exports = app;

