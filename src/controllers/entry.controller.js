import { pool } from "../config/db.js";

export const entryScan = async (req, res) => {
  try {
    const { qrData, gate } = req.body;

    const parsed = JSON.parse(qrData);

    const user = await pool.query(
      "SELECT id, user_type FROM users WHERE id=$1 AND is_active=true",
      [parsed.uid]
    );

    if (user.rowCount === 0) {
      return res.json({
        allowed: false,
        reason: "Invalid user"
      });
    }

    await pool.query(
      `INSERT INTO entry_logs (user_id, gate_name, access_granted)
       VALUES ($1,$2,true)`,
      [parsed.uid, gate || "MAIN"]
    );

    res.json({
      allowed: true,
      user_type: user.rows[0].user_type
    });
  } catch (err) {
    res.status(400).json({ error: "Invalid QR" });
  }
};
