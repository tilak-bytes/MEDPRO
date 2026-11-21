import express from "express";
import {
  bookAppointment,
  cancelAppointment,
  getUserProfile,
  listAppointment,
  loginUser,
  makePayment,
  registerUser,
  updateUserProfile,
  sendResetOtpUser,
  verifyResetOtpUser,
  resetPasswordUser,
  sendSignupOtp,
  updateUserIdentifierRequest,
  updateUserIdentifierVerify,
} from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";
import upload from "../middlewares/multer.js";

const userRouter = express.Router();

userRouter.post("/send-signup-otp", sendSignupOtp);
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

userRouter.get("/get-profile", authUser, getUserProfile);
userRouter.post(
  "/update-profile",
  upload.single("image"),
  authUser,
  updateUserProfile,
);
userRouter.post("/book-appointment", authUser, bookAppointment);
userRouter.get("/appointments", authUser, listAppointment);
userRouter.post("/cancel-appointment", authUser, cancelAppointment);
userRouter.post("/make-payment", authUser, makePayment);
userRouter.post("/send-reset-otp", sendResetOtpUser);
userRouter.post("/verify-reset-otp", verifyResetOtpUser);
userRouter.post("/reset-password", resetPasswordUser);

userRouter.post("/update-identifier-request", authUser, updateUserIdentifierRequest);
userRouter.post("/update-identifier-verify", authUser, updateUserIdentifierVerify);

export default userRouter;
