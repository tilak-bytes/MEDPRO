import express from "express";
import {
  addDoctor,
  adminDashboard,
  appointmentCancelAdmin,
  appointmentsAdmin,
  getAllDoctors,
  loginAdmin,
  getDoctorUpdateRequests,
  approveDoctorUpdate,
  rejectDoctorUpdate,
} from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";
import authAdmin from "../middlewares/authAdmin.js";
import { changeAvailability } from "../controllers/doctorController.js";

const adminRouter = express.Router();

adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);
adminRouter.post("/login", loginAdmin);
adminRouter.get("/all-doctors", authAdmin, getAllDoctors);
adminRouter.post("/change-availability", authAdmin, changeAvailability);
adminRouter.get("/appointments", authAdmin, appointmentsAdmin);
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancelAdmin);
adminRouter.get("/dashboard", authAdmin, adminDashboard);

adminRouter.get("/update-requests", authAdmin, getDoctorUpdateRequests);
adminRouter.post("/approve-update", authAdmin, approveDoctorUpdate);
adminRouter.post("/reject-update", authAdmin, rejectDoctorUpdate);

export default adminRouter;
