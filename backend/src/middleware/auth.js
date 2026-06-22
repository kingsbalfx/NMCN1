const jwt = require("jsonwebtoken");

module.exports = function authMiddleware(req, res, next) {
  try {
    // Support both Authorization header and HttpOnly cookie (from server-set login)
    const headerToken = req.headers.authorization?.split(" ")[1];
    const cookieToken = req.cookies?.token;
    const token = headerToken || cookieToken;

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
      res.status(401).json({ error: "Invalid or malformed token" });
    }
  } catch (err) {
    res.status(401).json({ error: "Authentication error" });
  }
};
