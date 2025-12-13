import QRCode from "qrcode";
import crypto from "crypto";

export async function generateQR(user) {
  const payload = {
    uid: user.id,
    type: user.user_type,
    event: "SANSKRUTHI2K26"
  };

  const signature = crypto
    .createHmac("sha256", process.env.QR_SECRET)
    .update(JSON.stringify(payload))
    .digest("hex");

  const qrData = JSON.stringify({ ...payload, sig: signature });

  return await QRCode.toDataURL(qrData);
}
