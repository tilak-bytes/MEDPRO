import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";
import { sendEmailSafe } from "../utils/emailHelper.js";
import { sendCancellationEmail } from "../config/emailService.js";

// Free up a doctor's booked slot
export const releaseSlot = async (docId, slotDate, slotTime) => {
  const doctorData = await doctorModel.findById(docId).select("-password");
  if (doctorData) {
    let slots_booked = doctorData.slots_booked;
    if (slots_booked[slotDate]) {
      slots_booked[slotDate] = slots_booked[slotDate].filter(
        (time) => time !== slotTime
      );
      await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    }
  }
  return doctorData;
};

// Cancel appointment → update DB, release slot, email user
export const cancelAppointmentWorkflow = async (appointmentId) => {
  const appointmentData = await appointmentModel.findById(appointmentId);
  if (!appointmentData) {
    throw new Error("Appointment not found.");
  }

  await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

  const { docId, slotDate, slotTime } = appointmentData;
  const doctorData = await releaseSlot(docId, slotDate, slotTime);

  const userData = await userModel.findById(appointmentData.userId).select("-password");
  if (userData && userData.email) {
    await sendEmailSafe(() =>
      sendCancellationEmail({
        userName: userData.name,
        userEmail: userData.email,
        docName: doctorData ? doctorData.name : "Doctor",
        speciality: doctorData ? doctorData.speciality : "",
        slotDate: appointmentData.slotDate,
        slotTime: appointmentData.slotTime,
        fees: appointmentData.amount,
        paymentDone: appointmentData.payment,
      })
    );
  }

  return appointmentData;
};
