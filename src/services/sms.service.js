import axios from "axios";

export async function sendSMS(phone, otp) {
  await axios.post("SMS_API_ENDPOINT", {
    to: phone,
    message: `Your Sanskruthi 2K26 OTP is ${otp}`
  });
}
