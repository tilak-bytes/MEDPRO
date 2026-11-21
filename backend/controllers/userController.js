import validator from "validator";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import { v2 as cloudinary } from "cloudinary";
import appointmentModel from "../models/appointmentModel.js";
import {
  hashPassword,
  comparePassword,
  generateToken,
} from "../utils/authUtils.js";
import { sendEmailSafe } from "../utils/emailHelper.js";
import { normalizePhone } from "../utils/phoneUtils.js";
import { cancelAppointmentWorkflow } from "../services/appointmentService.js";
import { generateAndSaveOtp, verifyAndDeleteOtp } from "../services/otpService.js";
import { requestPasswordReset, verifyPasswordResetOtp, resetPasswordWithToken } from "../services/passwordService.js";
import {
  sendSignupEmail,
  sendLoginEmail,
  sendAppointmentEmail,
  sendPaymentEmail,
  sendSignupOtpEmail,
  sendIdentifierUpdateOtpEmail,
} from "../config/emailService.js";
import { sendOtpSms } from "../config/smsService.js";

const MAX_USERS = 100;

// Find user by email or 10-digit phone
const findUserByIdentifier = async (identifier) => {
  const isEmailInput = validator.isEmail(identifier);
  const isPhoneInput = /^\d{10}$/.test(identifier);

  if (!isEmailInput && !isPhoneInput) {
    throw new Error(
      "Please enter a valid email address or exactly 10-digit mobile number."
    );
  }

  let user;
  if (isEmailInput) {
    user = await userModel.findOne({ email: identifier });
  } else {
    user = await userModel.findOne({ phone: `+91${identifier}` });
  }

  return { user, isEmailInput, isPhoneInput };
};

// Step 1: Validate fields and send signup OTP
const sendSignupOtp = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Name, password, and confirm password are required.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least an email or mobile number.",
      });
    }

    if (email && !validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    let normalizedPhone = "";
    if (phone) {
      normalizedPhone = normalizePhone(phone);
      if (!normalizedPhone) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid 10-digit mobile number.",
        });
      }
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    const userCount = await userModel.countDocuments();
    if (userCount >= MAX_USERS) {
      return res.status(403).json({
        success: false,
        message: `User limit of ${MAX_USERS} reached.`,
      });
    }

    if (email) {
      const existingEmail = await userModel.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "This email address is already in use.",
        });
      }
    }

    if (normalizedPhone) {
      const existingPhone = await userModel.findOne({ phone: normalizedPhone });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: "This mobile number is already in use.",
        });
      }
    }

    // Generate and save OTP
    const identifier = email || normalizedPhone; // Use email if available, else phone
    const otp = await generateAndSaveOtp(identifier);

    if (email) {
      await sendEmailSafe(() =>
        sendSignupOtpEmail({ userName: name, userEmail: email, otp })
      );
    }
    if (normalizedPhone) {
      await sendOtpSms({ phone: normalizedPhone, otp });
    }

    res.status(200).json({ success: true, message: "OTP sent successfully." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Step 2: Verify OTP and create account
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required.",
      });
    }

    let normalizedPhone = "";
    if (phone) {
      normalizedPhone = normalizePhone(phone);
    }

    const identifier = email || normalizedPhone;

    const isValidOtp = await verifyAndDeleteOtp(identifier, otp);
    if (!isValidOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP.",
      });
    }

    // Double check uniqueness
    if (email) {
      const existingEmail = await userModel.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: "Email in use." });
      }
    }

    if (normalizedPhone) {
      const existingPhone = await userModel.findOne({ phone: normalizedPhone });
      if (existingPhone) {
        return res.status(400).json({ success: false, message: "Phone in use." });
      }
    }

    // Hash password & create user
    const hashedPassword = await hashPassword(password);

    const userData = { name, password: hashedPassword };
    if (email) userData.email = email;
    if (normalizedPhone) userData.phone = normalizedPhone;

    const newUser = new userModel(userData);
    const user = await newUser.save();

    const token = generateToken({ id: user._id });

    // Send Welcome Email if email is available
    if (email) {
      await sendEmailSafe(() =>
        sendSignupEmail({ userName: name, userEmail: email })
      );
    }

    res.status(201).json({ success: true, token, message: "Account created successfully!" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email/mobile number and password.",
      });
    }

    const { user } = await findUserByIdentifier(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email or mobile number.",
      });
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Wrong password.",
      });
    }

    const token = generateToken({ id: user._id });

    if (user.email) {
      await sendEmailSafe(() =>
        sendLoginEmail({ userName: user.name, userEmail: user.email }),
      );
    }

    res.status(200).json({ success: true, token });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const userData = await userModel.findById(userId).select("-password");

    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found. Auth Failed." });
    }

    res.status(200).json({ success: true, userData });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { name, address, dob, gender } = req.body;
    const imgFile = req.file;

    if (!name || !address || !dob || !gender) {
      return res.status(404).json({
        success: false,
        message: "User data is missing.",
      });
    }

    const userData = {
      name,
      address: JSON.parse(address),
      dob,
      gender,
    };

    await userModel.findByIdAndUpdate(userId, userData);

    // Sync the updated name/address to all historical appointments to prevent the "old name" issue
    await appointmentModel.updateMany(
      { userId },
      { 
        $set: { 
          "userData.name": name,
          "userData.address": JSON.parse(address),
          "userData.dob": dob,
          "userData.gender": gender
        } 
      }
    );

    if (imgFile) {
      const imgUpload = await cloudinary.uploader.upload(imgFile.path, {
        resource_type: "image",
        folder: process.env.CLOUDINARY_FOLDER,
      });
      const imgURL = imgUpload.secure_url;
      await userModel.findByIdAndUpdate(userId, { image: imgURL });
    }

    res.status(200).json({ success: true, message: "User profile updated." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Send OTP to verify new email/phone before updating
const updateUserIdentifierRequest = async (req, res) => {
  try {
    const { userId } = req.user;
    const { newIdentifier } = req.body;

    if (!newIdentifier) {
      return res.status(400).json({ success: false, message: "New identifier is required." });
    }

    const isEmailInput = validator.isEmail(newIdentifier);
    const isPhoneInput = /^\d{10}$/.test(newIdentifier);

    if (!isEmailInput && !isPhoneInput) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address or exactly 10-digit mobile number.",
      });
    }

    let normalizedIdentifier = newIdentifier;
    if (isEmailInput) {
      const existing = await userModel.findOne({ email: newIdentifier });
      if (existing) {
        return res.status(400).json({ success: false, message: "This email is already in use." });
      }
    } else {
      normalizedIdentifier = `+91${newIdentifier}`;
      const existing = await userModel.findOne({ phone: normalizedIdentifier });
      if (existing) {
        return res.status(400).json({ success: false, message: "This phone number is already in use." });
      }
    }

    const user = await userModel.findById(userId);

    const otp = await generateAndSaveOtp(normalizedIdentifier);

    if (isEmailInput) {
      await sendEmailSafe(() =>
        sendIdentifierUpdateOtpEmail({ userName: user.name, userEmail: normalizedIdentifier, otp })
      );
    } else {
      await sendOtpSms({ phone: normalizedIdentifier, otp });
    }

    res.status(200).json({ success: true, message: "OTP sent successfully to your new contact method." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Verify OTP and update email/phone
const updateUserIdentifierVerify = async (req, res) => {
  try {
    const { userId } = req.user;
    const { newIdentifier, otp } = req.body;

    if (!newIdentifier || !otp) {
      return res.status(400).json({ success: false, message: "Identifier and OTP are required." });
    }

    const isEmailInput = validator.isEmail(newIdentifier);
    const normalizedIdentifier = isEmailInput ? newIdentifier : `+91${newIdentifier}`;

    const isValidOtp = await verifyAndDeleteOtp(normalizedIdentifier, otp);
    if (!isValidOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired or is incorrect.",
      });
    }

    // Update the user
    if (isEmailInput) {
      await userModel.findByIdAndUpdate(userId, { email: normalizedIdentifier });
    } else {
      await userModel.findByIdAndUpdate(userId, { phone: normalizedIdentifier });
    }

    res.status(200).json({ success: true, message: "Account details updated successfully." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const bookAppointment = async (req, res) => {
  try {
    const { userId } = req.user;
    const { docId, slotDate, slotTime } = req.body;

    const docData = await doctorModel.findById(docId).select("-password");

    if (!docData.available) {
      return res.status(404).json({
        success: false,
        message: "Doctor not available. Please choose another doctor.",
      });
    }

    let slots_booked = docData.slots_booked;

    // check slot availability
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.status(400).json({
          success: false,
          message: "This slot is already booked.",
        });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);
    }

    const userData = await userModel.findById(userId).select("-password");

    delete docData.slots_booked;

    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now(),
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    await sendEmailSafe(() =>
      sendAppointmentEmail({
        userName: userData.name,
        userEmail: userData.email,
        docName: docData.name,
        speciality: docData.speciality,
        slotDate,
        slotTime,
        fees: docData.fees,
      }),
    );

    // save new slots data in docData
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.status(200).json({
      success: true,
      message: "Appointment booked successfully.",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const listAppointment = async (req, res) => {
  try {
    const { userId } = req.user;
    const appointments = await appointmentModel.find({ userId });

    res.status(200).json({ success: true, appointments });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const { userId } = req.user;
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    if (appointmentData.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this appointment.",
      });
    }

    await cancelAppointmentWorkflow(appointmentId);

    res.status(200).json({ success: true, message: "Appointment cancelled." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const makePayment = async (req, res) => {
  try {
    const { userId } = req.user;
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    if (appointmentData.cancelled) {
      return res.status(400).json({
        success: false,
        message: "Appointment cancelled.",
      });
    }

    if (appointmentData.payment) {
      return res.status(400).json({
        success: false,
        message: "Payment already completed.",
      });
    }

    if (appointmentData.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to make payment for this appointment.",
      });
    }

    appointmentData.payment = true;
    await appointmentData.save();

    const userData = await userModel.findById(userId).select("-password");

    await sendEmailSafe(() =>
      sendPaymentEmail({
        userName: userData.name,
        userEmail: userData.email,
        docName: appointmentData.docData.name,
        speciality: appointmentData.docData.speciality,
        slotDate: appointmentData.slotDate,
        slotTime: appointmentData.slotTime,
        fees: appointmentData.amount,
      }),
    );

    res.status(200).json({ success: true, message: "Payment successful." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Forgot password — send OTP
const sendResetOtpUser = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email or mobile number is required." });
    }

    await requestPasswordReset(userModel, email);
    res.status(200).json({ success: true, message: "OTP sent successfully." });
  } catch (error) {
    if (error.message.includes("No account found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// Forgot password — verify OTP
const verifyResetOtpUser = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email/Mobile and OTP are required." });
    }

    const resetToken = await verifyPasswordResetOtp(userModel, email, otp);
    res.status(200).json({ success: true, resetToken });
  } catch (error) {
    if (error.message.includes("No account found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// Forgot password — set new password
const resetPasswordUser = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    await resetPasswordWithToken(userModel, resetToken, newPassword);
    res.status(200).json({ success: true, message: "Password reset successfully." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  makePayment,
  sendResetOtpUser,
  verifyResetOtpUser,
  resetPasswordUser,
  sendSignupOtp,
  updateUserIdentifierRequest,
  updateUserIdentifierVerify,
};
