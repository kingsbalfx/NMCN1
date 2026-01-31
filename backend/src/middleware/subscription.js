const pool = require("../config/db");

module.exports = async function subscriptionMiddleware(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const user = await pool.query(
      "SELECT subscription_expiry FROM users WHERE id=$1",
      [req.user.id]
    );

    if (!user.rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const subscriptionExpiry = user.rows[0].subscription_expiry;
    const now = new Date();

    if (
      !subscriptionExpiry ||
      new Date(subscriptionExpiry) < now
    ) {
      return res.status(403).json({
        error: "Active subscription required",
        expiryDate: subscriptionExpiry
      });
    }

    next();
  } catch (err) {
    console.error("Subscription middleware error:", err);
    res.status(500).json({ error: "Failed to verify subscription" });
  }
};
