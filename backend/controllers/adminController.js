import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import { hashPassword, generateToken } from "../utils/authUtils.js";
import { sendEmailSafe } from "../utils/emailHelper.js";
import { normalizePhone } from "../utils/phoneUtils.js";
import { cancelAppointmentWorkflow } from "../services/appointmentService.js";
import { getAdminDashboardStats } from "../services/dashboardService.js";
import appointmentModel from "../models/appointmentModel.js";
import doctorUpdateModel from "../models/doctorUpdateModel.js";
import {
  sendDoctorProfileUpdateApprovedEmail,
  sendDoctorProfileUpdateRejectedEmail
} from "../config/emailService.js";

const addDoctor = async (req, res) => {
  try {
    const {
      name, email, phone, password,
      speciality, degree, experience,
      about, fees, address,
    } = req.body;
    const imageFile = req.file;

    if (
      !name || !email || !password || !speciality ||
      !degree || !experience || !about || !fees ||
      !address || !imageFile
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all fields" });
    }

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid email!" });
    }

    if (phone && !/^\+91\d{10}$/.test(phone) && !/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit Indian mobile number!",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long!",
      });
    }

    const hashedPassword = await hashPassword(password);

    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
      folder: process.env.CLOUDINARY_FOLDER,
    });
    const imageUrl = imageUpload.secure_url;

    const normalizedPhone = normalizePhone(phone);

    const doctorData = {
      name, email,
      phone: normalizedPhone,
      password: hashedPassword,
      speciality, degree, experience,
      about, fees,
      address: JSON.parse(address),
      image: imageUrl,
      date: Date.now(),
    };

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    res.status(201).json({
      success: true,
      message: "Doctor added successfully",
    });
  } catch (error) {
    // Handle duplicate email/phone
    if (error.code === 11000) {
      if (error.keyPattern && error.keyPattern.email) {
        return res.status(400).json({ success: false, message: "A doctor with this email already exists." });
      }
      if (error.keyPattern && error.keyPattern.phone) {
        return res.status(400).json({ success: false, message: "A doctor with this phone number already exists." });
      }
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter email and password!" });
    }

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = generateToken({ id: email + password });
      return res.status(200).json({
        success: true,
        token,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel
      .find({})
      .select("-password")
      .sort({ date: -1 });
    res.status(200).json({
      success: true,
      doctors,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

const appointmentsAdmin = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({});

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

const appointmentCancelAdmin = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    await cancelAppointmentWorkflow(appointmentId);

    res.status(200).json({
      success: true,
      message: "Appointment cancelled.",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const adminDashboard = async (req, res) => {
  try {
    const dashData = await getAdminDashboardStats();

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

const getDoctorUpdateRequests = async (req, res) => {
  try {
    const requests = await doctorUpdateModel.find({ status: "pending" }).populate({
      path: "docId",
      select: "name image speciality degree",
    });

    res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const approveDoctorUpdate = async (req, res) => {
  try {
    const { requestId } = req.body;

    const request = await doctorUpdateModel.findById(requestId);
    if (!request || request.status !== "pending") {
      return res.status(404).json({ success: false, message: "Request not found or already processed." });
    }

    await doctorModel.findByIdAndUpdate(request.docId, request.updateData);

    // Sync the updated doctor name to historical appointments to prevent the "old name" issue
    if (request.updateData.name) {
      await appointmentModel.updateMany(
        { docId: request.docId },
        { $set: { "docData.name": request.updateData.name } }
      );
    }

    request.status = "approved";
    await request.save();

    const doctor = await doctorModel.findById(request.docId);

    await sendEmailSafe(() =>
      sendDoctorProfileUpdateApprovedEmail({
        userName: doctor.name,
        userEmail: doctor.email
      })
    );

    res.status(200).json({
      success: true,
      message: "Doctor profile updated successfully.",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const rejectDoctorUpdate = async (req, res) => {
  try {
    const { requestId } = req.body;

    const request = await doctorUpdateModel.findById(requestId);
    if (!request || request.status !== "pending") {
      return res.status(404).json({ success: false, message: "Request not found or already processed." });
    }

    request.status = "rejected";
    await request.save();

    const doctor = await doctorModel.findById(request.docId);

    await sendEmailSafe(() =>
      sendDoctorProfileUpdateRejectedEmail({
        userName: doctor.name,
        userEmail: doctor.email
      })
    );

    res.status(200).json({
      success: true,
      message: "Request rejected.",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  addDoctor,
  loginAdmin,
  getAllDoctors,
  appointmentsAdmin,
  appointmentCancelAdmin,
  adminDashboard,
  getDoctorUpdateRequests,
  approveDoctorUpdate,
  rejectDoctorUpdate,
};
