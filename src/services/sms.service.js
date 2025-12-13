import axios from "axios";

export async function sendSMS(phone, message) {
  await axios.post("SMS_PROVIDER_API", {
    to: phone,
    message
  });
}
