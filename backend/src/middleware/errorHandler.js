/**
 * Global Error Handling Middleware
 * Must be placed AFTER all other middleware and routes
 */
module.exports = function (err, req, res, next) {
  console.error("Error:", err);

  // Database errors
  if (err.code && err.code.startsWith("23")) {
    return res.status(400).json({ error: "Database constraint error", details: err.message });
  }

  // Validation errors
  if (err.message && err.message.includes("JSON")) {
    return res.status(400).json({ error: "Invalid JSON data" });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Invalid token" });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Token expired" });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
};
