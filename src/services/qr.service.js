import QRCode from "qrcode";
import crypto from "crypto";

export async function generateQR(user) {
  const payload = {
    uid: user.id,
    type: user.user_type,
    event: "SANSKRUTHI2K26"
  };

  const sig = crypto
    .createHmac("sha256", process.env.QR_SECRET)
    .update(JSON.stringify(payload))
    .digest("hex");

  const data = JSON.stringify({ ...payload, sig });

  return await QRCode.toDataURL(data);
}
