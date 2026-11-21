import otpModel from "../models/otpModel.js";
import { generateOtp } from "../utils/authUtils.js";

// Generate OTP, clear old ones, save new one
export const generateAndSaveOtp = async (identifier) => {
  const otp = generateOtp();
  await otpModel.deleteMany({ identifier });
  await otpModel.create({ identifier, otp });
  return otp;
};

// Check if OTP matches, delete it after use
export const verifyAndDeleteOtp = async (identifier, otp) => {
  const validOtp = await otpModel.findOne({ identifier, otp });
  if (!validOtp) {
    return false;
  }
  await otpModel.deleteOne({ _id: validOtp._id });
  return true;
};
