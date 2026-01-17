const pool = require("../config/db");

module.exports = async function (req, res, next) {
  const user = await pool.query(
    "SELECT subscription_expiry FROM users WHERE id=$1",
    [req.user.id]
  );

  if (
    !user.rows[0].subscription_expiry ||
    new Date(user.rows[0].subscription_expiry) < new Date()
  ) {
    return res.status(403).json({ error: "Subscription required" });
  }

  next();
};
