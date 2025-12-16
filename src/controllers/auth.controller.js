import bcrypt from "bcrypt";
import { pool } from "../config/db.js";
import { generateOTP, saveOTP } from "../services/otp.service.js";
import { sendSMS } from "../services/sms.service.js";
import { generateQR } from "../services/qr.service.js";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await pool.query(
    `SELECT * FROM users WHERE email=$1 AND is_verified=true`,
    [email]
  );

  if (user.rowCount === 0) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const match = await bcrypt.compare(
    password,
    user.rows[0].password_hash
  );

  if (!match) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user.rows[0].id, type: user.rows[0].user_type },
    process.env.JWT_SECRET
  );

  res.json({ token });
};


export const verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;

  const result = await pool.query(
    `SELECT * FROM otp_verifications
     WHERE phone=$1 AND otp_code=$2 AND is_used=false
     AND expires_at > NOW()`,
    [phone, otp]
  );

  if (result.rowCount === 0) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  await pool.query(
    `UPDATE otp_verifications SET is_used=true WHERE id=$1`,
    [result.rows[0].id]
  );

  const user = await pool.query(
    `UPDATE users SET is_verified=true WHERE phone=$1 RETURNING *`,
    [phone]
  );

  const qr = await generateQR(user.rows[0]);

  res.json({ message: "Verified", qr });
};


export const sendOtp = async (req, res) => {
  const { phone } = req.body;

  const otp = generateOTP();
  await saveOTP(phone, otp);
  await sendSMS(phone, otp);

  res.json({ message: "OTP sent" });
};

export const register = async (req, res) => {
  try {
    const {
      full_name,
      phone,
      email,
      password,
      college_id,
      college_name_manual,
      user_type,
      id_proof_type,
      id_proof_url
    } = req.body;

    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users
       (full_name, phone, email, password_hash,
        college_id, college_name_manual,
        user_type, id_proof_type, id_proof_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id`,
      [
        full_name,
        phone,
        email,
        hash,
        college_id || null,
        college_name_manual || null,
        user_type,
        id_proof_type,
        id_proof_url
      ]
    );

    res.status(201).json({
      message: "Registered. OTP pending.",
      user_id: result.rows[0].id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
