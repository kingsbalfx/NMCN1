const pool = require("../config/db");

module.exports = async function subscriptionMiddleware(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Demo mode - allow bundled demo/admin users, require payment for newly registered demo users.
    if (pool.isDemoMode) {
      if (req.user.has_paid || req.user.permanent_access || req.user.id === 1 || req.user.id === 2) {
        return next();
      }
      return res.status(403).json({
        error: "One-time access payment required",
        amount: 450,
        currency: "NGN",
        payment_type: "permanent"
      });
    }

    try {
      const user = await pool.query(
        "SELECT has_paid, permanent_access FROM users WHERE id=$1",
        [req.user.id]
      );

      if (!user.rows.length) {
        return res.status(404).json({ error: "User not found" });
      }

      if (!user.rows[0].has_paid || !user.rows[0].permanent_access) {
        return res.status(403).json({
          error: "One-time access payment required",
          amount: 450,
          currency: "NGN",
          payment_type: "permanent"
        });
      }

      return next();
    } catch (dbErr) {
      console.error("Database error:", dbErr.message);
      res.status(500).json({ error: "Failed to verify access" });
    }
  } catch (err) {
    console.error("Access middleware error:", err);
    res.status(500).json({ error: "Failed to verify access" });
  }
};
