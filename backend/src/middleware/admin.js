const pool = require("../config/db");

module.exports = async function (req, res, next) {
  const user = await pool.query(
    "SELECT role FROM users WHERE id=$1",
    [req.user.id]
  );

  if (user.rows[0].role !== "admin") {
    return res.status(403).json({ error: "Admin access only" });
  }

  next();
};
