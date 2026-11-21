import validator from "validator";
import doctorModel from "../models/doctorModel.js";
import {
  comparePassword,
  generateToken,
} from "../utils/authUtils.js";
import { v2 as cloudinary } from "cloudinary";
import appointmentModel from "../models/appointmentModel.js";
import doctorUpdateModel from "../models/doctorUpdateModel.js";
import { sendEmailSafe } from "../utils/emailHelper.js";
import { cancelAppointmentWorkflow } from "../services/appointmentService.js";
import { generateAndSaveOtp, verifyAndDeleteOtp } from "../services/otpService.js";
import { requestPasswordReset, verifyPasswordResetOtp, resetPasswordWithToken } from "../services/passwordService.js";
import { getDoctorDashboardStats } from "../services/dashboardService.js";
import {
  sendAppointmentCompletedEmail,
  sendIdentifierUpdateOtpEmail,
  sendDoctorProfileUpdateRequestEmail,
} from "../config/emailService.js";

const changeAvailability = async (req, res) => {
  try {
    const { docId } = req.body;
    const docData = await doctorModel.findById(docId);
    await doctorModel.findByIdAndUpdate(docId, {
      available: !docData.available,
    });
    res.status(200).json({
      success: true,
      message: "Doctor availability status changed successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select(["-password", "-email"]);
    res.status(200).json({
      success: true,
      doctors,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email/mobile number and password.",
      });
    }

    // Search by email or phone (handles +91 prefix)
    const doctor = await doctorModel.findOne({
      $or: [
        { email },
        { phone: email },
        { phone: `+91${email}` }
      ]
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "No doctor account found with this email or mobile number.",
      });
    }

    const isMatch = await comparePassword(password, doctor.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }

    const token = generateToken({ id: doctor._id });

    res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

const appointmentsDoctor = async (req, res) => {
  try {
    const { docId } = req.user;
    const appointments = await appointmentModel.find({ docId });

    res.status(200).json({
      success: true,
      appointments,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const appointmentComplete = async (req, res) => {
  try {
    const { docId } = req.user;
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData && appointmentData.docId.toString() === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        isCompleted: true,
      });

      await sendEmailSafe(() =>
        sendAppointmentCompletedEmail({
          userName: appointmentData.userData.name,
          userEmail: appointmentData.userData.email,
          docName: appointmentData.docData.name,
          speciality: appointmentData.docData.speciality,
          slotDate: appointmentData.slotDate,
          slotTime: appointmentData.slotTime,
        }),
      );

      return res.status(200).json({
        success: true,
        message: "Appointment Completed.",
      });
    } else {
      return res.status(403).json({
        success: false,
        message: "Unauthorized action.",
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const appointmentCancel = async (req, res) => {
  try {
    const { docId } = req.user;
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData && appointmentData.docId.toString() === docId) {
      await cancelAppointmentWorkflow(appointmentId);

      return res.status(200).json({
        success: true,
        message: "Appointment Cancelled.",
      });
    } else {
      return res.status(403).json({
        success: false,
        message: "Unauthorized action.",
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const doctorDashboard = async (req, res) => {
  try {
    const { docId } = req.user;
    const dashData = await getDoctorDashboardStats(docId);

    res.status(200).json({
      success: true,
      dashData,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const doctorProfile = async (req, res) => {
  try {
    const { docId } = req.user;
    const profileData = await doctorModel.findById(docId).select("-password");

    if (!profileData) {
      return res.status(404).json({ success: false, message: "Doctor not found." });
    }

    res.status(200).json({
      success: true,
      profileData,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// 'available' updates instantly, other fields go to Admin approval queue
const updateDoctorProfile = async (req, res) => {
  try {
    const { docId } = req.user;
    const { available, reason, ...otherFields } = req.body;
    const imageFile = req.file;

    if (available !== undefined) {
      const isAvailable = available === "true" || available === true;
      await doctorModel.findByIdAndUpdate(docId, { available: isAvailable });
    }

    if (otherFields.phone) {
      if (!otherFields.phone.startsWith('+91')) {
        otherFields.phone = `+91${otherFields.phone}`;
      }
    }

    if (otherFields.address_line1 !== undefined || otherFields.address_line2 !== undefined) {
      otherFields.address = {
        line1: otherFields.address_line1 || "",
        line2: otherFields.address_line2 || ""
      };
      delete otherFields.address_line1;
      delete otherFields.address_line2;
    }

    if (otherFields.fees) {
      otherFields.fees = Number(otherFields.fees);
    }

    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
        folder: process.env.CLOUDINARY_FOLDER,
      });
      otherFields.image = imageUpload.secure_url;
    }

    if (Object.keys(otherFields).length > 0) {
      const doctor = await doctorModel.findById(docId);

      // Build comparison data for admin email
      const fieldMapping = {
        name: "Name", email: "Email", phone: "Phone",
        speciality: "Speciality", degree: "Degree", experience: "Experience",
        about: "About", fees: "Consultation Fee", address: "Address", image: "Profile Image"
      };

      const comparisonData = [];
      for (const key in otherFields) {
        let oldValue = doctor[key];
        let newValue = otherFields[key];

        if (key === 'address') {
          oldValue = `${doctor.address.line1}${doctor.address.line2 ? ', ' + doctor.address.line2 : ''}`;
          newValue = `${otherFields.address.line1}${otherFields.address.line2 ? ', ' + otherFields.address.line2 : ''}`;
        } else if (key === 'fees') {
          oldValue = `₹${doctor.fees}`;
          newValue = `₹${otherFields.fees}`;
        }

        comparisonData.push({
          field: fieldMapping[key] || key,
          old: oldValue,
          new: newValue
        });
      }

      // Merge with existing pending request or create new
      const existingRequest = await doctorUpdateModel.findOne({ docId, status: "pending" });

      if (existingRequest) {
        existingRequest.updateData = { ...existingRequest.updateData, ...otherFields };
        existingRequest.reason = reason;
        existingRequest.date = Date.now();
        await existingRequest.save();
      } else {
        await doctorUpdateModel.create({
          docId,
          updateData: otherFields,
          reason: reason,
          status: "pending",
          date: Date.now()
        });
      }

      await sendEmailSafe(() =>
        sendDoctorProfileUpdateRequestEmail({
          userName: doctor.name,
          userEmail: doctor.email,
          comparisonData,
          reason
        })
      );

      return res.status(200).json({
        success: true,
        message: "Profile update request sent to Admin for approval.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Availability Updated.",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Forgot password — send OTP
const sendResetOtpDoctor = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email or mobile number is required." });
    }

    await requestPasswordReset(doctorModel, email);
    res.status(200).json({ success: true, message: "OTP sent successfully." });
  } catch (error) {
    if (error.message.includes("No account found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// Forgot password — verify OTP
const verifyResetOtpDoctor = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email/Mobile and OTP are required." });
    }

    const resetToken = await verifyPasswordResetOtp(doctorModel, email, otp);
    res.status(200).json({ success: true, resetToken });
  } catch (error) {
    if (error.message.includes("No account found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// Forgot password — set new password
const resetPasswordDoctor = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    await resetPasswordWithToken(doctorModel, resetToken, newPassword);
    res.status(200).json({ success: true, message: "Password reset successfully." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Send OTP to verify new email/phone
const updateDoctorIdentifierRequest = async (req, res) => {
  try {
    const { docId } = req.user;
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

    const existing = await doctorModel.findOne({
      $or: [
        { email: newIdentifier },
        { phone: newIdentifier },
        { phone: `+91${newIdentifier}` }
      ]
    });

    if (existing) {
      return res.status(400).json({ success: false, message: "This email or phone number is already in use by another doctor." });
    }

    let normalizedIdentifier = isEmailInput ? newIdentifier : `+91${newIdentifier}`;

    const doctor = await doctorModel.findById(docId);

    const otp = await generateAndSaveOtp(normalizedIdentifier);

    if (isEmailInput) {
      await sendEmailSafe(() =>
        sendIdentifierUpdateOtpEmail({ userName: doctor.name, userEmail: normalizedIdentifier, otp })
      );
    } else {
      await sendOtpSms({ phone: normalizedIdentifier, otp });
    }

    res.status(200).json({ success: true, message: "OTP sent successfully to your new contact method." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Verify OTP for contact change
const updateDoctorIdentifierVerify = async (req, res) => {
  try {
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

    res.status(200).json({ success: true, message: "Verified successfully." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export {
  changeAvailability,
  doctorList,
  loginDoctor,
  appointmentsDoctor,
  appointmentComplete,
  appointmentCancel,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
  sendResetOtpDoctor,
  verifyResetOtpDoctor,
  resetPasswordDoctor,
  updateDoctorIdentifierRequest,
  updateDoctorIdentifierVerify,
};
