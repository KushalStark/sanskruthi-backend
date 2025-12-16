import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";
import crypto from "crypto";
import { pool } from "../config/db.js";

export const markPrinted = async (req, res) => {
  const { user_id, card_type } = req.body;

  await pool.query(
    `INSERT INTO id_cards (user_id, card_type, printed, printed_at)
     VALUES ($1,$2,true,NOW())`,
    [user_id, card_type]
  );

  res.json({ message: "Printed" });
};
export const listUsers = async (req, res) => {
  try {
    const { search = "", type = "" } = req.query;

    let query = `
      SELECT u.id, u.full_name, u.phone, u.email,
             u.user_type,
             COALESCE(c.name, u.college_name_manual) AS college_name
      FROM users u
      LEFT JOIN colleges c ON u.college_id = c.id
      WHERE 1=1
    `;
    const values = [];

    if (search) {
      values.push(`%${search}%`);
      query += `
        AND (u.full_name ILIKE $${values.length}
        OR u.phone ILIKE $${values.length}
        OR u.email ILIKE $${values.length})
      `;
    }

    if (type) {
      values.push(type);
      query += ` AND u.user_type = $${values.length}`;
    }

    query += " ORDER BY u.created_at DESC";

    const users = await pool.query(query, values);
    res.json(users.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const promoteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    await pool.query(
      `UPDATE users
       SET user_type='PARTICIPANT'
       WHERE id=$1 AND user_type='NORMAL'`,
      [userId]
    );

    res.json({ message: "User promoted to PARTICIPANT" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    await pool.query(
      "DELETE FROM users WHERE id=$1",
      [userId]
    );

    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const scanQR = async (req, res) => {
  const { qrData } = req.body;

  const parsed = JSON.parse(qrData);
  const { uid, type, event, sig } = parsed;

  const checkSig = crypto
    .createHmac("sha256", process.env.QR_SECRET)
    .update(JSON.stringify({ uid, type, event }))
    .digest("hex");

  if (sig !== checkSig) {
    return res.status(400).json({ error: "Invalid QR" });
  }

  const user = await pool.query(
    `SELECT u.*, c.name AS college_name
     FROM users u
     LEFT JOIN colleges c ON u.college_id=c.id
     WHERE u.id=$1`,
    [uid]
  );

  res.json(user.rows[0]);
};


export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  const admin = await pool.query(
    "SELECT * FROM admins WHERE email=$1",
    [email]
  );

  if (admin.rowCount === 0)
    return res.status(401).json({ error: "Invalid credentials" });

  const match = await bcrypt.compare(
    password,
    admin.rows[0].password_hash
  );

  if (!match)
    return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { id: admin.rows[0].id, role: admin.rows[0].role },
    process.env.JWT_SECRET
  );

  res.json({ token });
};
export const exportCSV = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT full_name, phone, email, user_type,
              COALESCE(c.name, college_name_manual) AS college
       FROM users u
       LEFT JOIN colleges c ON u.college_id = c.id
       ORDER BY user_type`
    );

    let csv = "Name,Phone,Email,Type,College\n";

    result.rows.forEach(r => {
      csv += `"${r.full_name}","${r.phone}","${r.email}",
              "${r.user_type}","${r.college}"\n`;
    });

    res.header("Content-Type", "text/csv");
    res.attachment("sanskruthi2k26_users.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// STEP 4.5 – Create VIP User
export const createVIP = async (req, res) => {
  const { full_name, phone, email } = req.body;

  try {
    await pool.query(
      `INSERT INTO users
       (full_name, phone, email, user_type, is_verified, created_by_admin)
       VALUES ($1,$2,$3,'VIP',true,true)`,
      [full_name, phone, email]
    );

    res.json({ message: "VIP user created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// STEP 4.5 – Delete User

// STEP 4.5 – Get All Users
export const getAllUsers = async (req, res) => {
  const users = await pool.query(
    "SELECT id, full_name, phone, email, user_type FROM users"
  );

  res.json(users.rows);
};


/* =======================
   ADMIN STATS
======================= */
export const getStats = async (req, res) => {
  try {
    const totalUsers = await pool.query(
      "SELECT COUNT(*) FROM users"
    );

    const participants = await pool.query(
      "SELECT COUNT(*) FROM users WHERE user_type='PARTICIPANT'"
    );

    const vip = await pool.query(
      "SELECT COUNT(*) FROM users WHERE user_type='VIP'"
    );

    const todayEntries = await pool.query(
      `SELECT COUNT(*) FROM entry_logs
       WHERE DATE(entry_time) = CURRENT_DATE`
    );

    res.json({
      totalUsers: Number(totalUsers.rows[0].count),
      participants: Number(participants.rows[0].count),
      vip: Number(vip.rows[0].count),
      todayEntries: Number(todayEntries.rows[0].count)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

