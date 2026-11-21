import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  identifier: { type: String, required: true }, // This will store either the email or the phone number
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, index: { expires: 300 } }, // Expires after 5 minutes (300 seconds)
});

const otpModel = mongoose.models.otp || mongoose.model("otp", otpSchema);

export default otpModel;
