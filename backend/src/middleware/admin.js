const pool = require("../config/db");

module.exports = async function adminMiddleware(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const user = await pool.query(
      "SELECT role FROM users WHERE id=$1",
      [req.user.id]
    );

    if (!user.rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.rows[0].role !== "admin") {
      return res.status(403).json({ error: "Admin privileges required" });
    }

    next();
  } catch (err) {
    console.error("Admin middleware error:", err);
    res.status(500).json({ error: "Failed to verify admin status" });
  }
};
