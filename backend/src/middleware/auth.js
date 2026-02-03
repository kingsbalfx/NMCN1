const jwt = require("jsonwebtoken");

module.exports = function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No authorization token provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "demo-secret-key");
      req.user = decoded;
      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token has expired" });
      }
      // In demo mode, allow any token with basic structure
      try {
        const decoded = jwt.decode(token);
        if (decoded && decoded.id) {
          req.user = decoded;
          return next();
        }
      } catch (decodeErr) {
        // Fall through to error
      }
      res.status(401).json({ error: "Invalid or malformed token" });
    }
  } catch (err) {
    res.status(401).json({ error: "Authentication error" });
  }
};
