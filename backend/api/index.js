require("dotenv").config();

const app = require("../src/server");

// Local development server
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  const HOST = process.env.HOST || "localhost";

  app.listen(PORT, HOST, () => {
    console.log(`✅ Server running on http://${HOST}:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  });
}

// Export for Vercel/Serverless
module.exports = app;

