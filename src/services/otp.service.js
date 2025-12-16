import { pool } from "../config/db.js";

export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function saveOTP(phone, otp) {
  const expires = new Date(Date.now() + 5 * 60 * 1000);

  await pool.query(
    `INSERT INTO otp_verifications (phone, otp_code, expires_at)
     VALUES ($1,$2,$3)`,
    [phone, otp, expires]
  );
}
