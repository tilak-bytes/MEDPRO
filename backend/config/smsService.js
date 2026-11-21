import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// ── send OTP via SMS using Twilio ────────────────────────────────
export const sendOtpSms = async ({ phone, otp }) => {
  if (process.env.SMS_ENABLED !== "true") {
    console.log(`[SMS DISABLED] OTP for ${phone}: ${otp}`);
    return;
  }
  try {
    await client.messages.create({
      body: `Your MEDPRO verification code is: ${otp}. Valid for 1 minute 30 seconds. Do not share this code.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
    console.log(`[SMS] OTP sent to ${phone}`);
  } catch (err) {
    console.error("SMS sending failed:", err.message);
  }
};

