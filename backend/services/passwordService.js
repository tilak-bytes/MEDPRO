import validator from "validator";
import { hashPassword, verifyToken, generateToken, generateOtp } from "../utils/authUtils.js";
import { sendEmailSafe } from "../utils/emailHelper.js";
import { sendOtpEmail } from "../config/emailService.js";
import { sendOtpSms } from "../config/smsService.js";

// Send password reset OTP (works for both Doctor and User models)
export const requestPasswordReset = async (Model, identifier) => {
  const isEmailInput = validator.isEmail(identifier);

  const user = await Model.findOne({
    $or: [
      { email: identifier },
      { phone: identifier },
      { phone: `+91${identifier}` }
    ]
  });

  if (!user) {
    throw new Error("No account found with this email or mobile number.");
  }

  const otp = generateOtp();
  const expiry = Date.now() + 90 * 1000; // 90 seconds

  await Model.findByIdAndUpdate(user._id, {
    resetOtp: otp,
    resetOtpExpiry: expiry,
  });

  if (isEmailInput && user.email) {
    await sendEmailSafe(() =>
      sendOtpEmail({ userName: user.name, userEmail: user.email, otp }),
    );
  } else if (!isEmailInput && user.phone) {
    await sendOtpSms({ phone: user.phone, otp });
  }

  return true;
};

// Verify OTP and return a short-lived reset token
export const verifyPasswordResetOtp = async (Model, identifier, otp) => {
  const user = await Model.findOne({
    $or: [
      { email: identifier },
      { phone: identifier },
      { phone: `+91${identifier}` }
    ]
  });

  if (!user) {
    throw new Error("No account found with this email or mobile number.");
  }

  if (user.resetOtp !== otp) {
    throw new Error("Invalid OTP.");
  }

  if (Date.now() > user.resetOtpExpiry) {
    throw new Error("OTP has expired. Please request a new one.");
  }

  const resetToken = generateToken({ id: user._id }, "10m");

  // Clear OTP — one time use only
  await Model.findByIdAndUpdate(user._id, {
    resetOtp: "",
    resetOtpExpiry: 0,
  });

  return resetToken;
};

// Reset password using a verified reset token
export const resetPasswordWithToken = async (Model, resetToken, newPassword) => {
  let decoded;
  try {
    decoded = verifyToken(resetToken);
  } catch {
    throw new Error("Reset session expired. Please start again.");
  }

  if (newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const hashedPassword = await hashPassword(newPassword);
  await Model.findByIdAndUpdate(decoded.id, { password: hashedPassword });

  return true;
};
