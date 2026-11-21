import doctorModel from "../models/doctorModel.js";
import userModel from "../models/userModel.js";
import appointmentModel from "../models/appointmentModel.js";

// Doctor dashboard stats
export const getDoctorDashboardStats = async (docId) => {
  const appointments = await appointmentModel.find({ docId });

  let earning = 0;
  appointments.forEach((item) => {
    if ((item.isCompleted || item.payment) && !item.cancelled) {
      earning += item.amount;
    }
  });

  let patients = [];
  appointments.forEach((item) => {
    if (!patients.includes(item.userId.toString())) {
      patients.push(item.userId.toString());
    }
  });

  return {
    earning,
    appointments: appointments.length,
    patients: patients.length,
    latestAppointments: appointments.reverse().slice(0, 5),
  };
};

// Admin dashboard stats
export const getAdminDashboardStats = async () => {
  const doctorsCount = await doctorModel.countDocuments({});
  const patientsCount = await userModel.countDocuments({});
  const appointments = await appointmentModel.find({});

  return {
    doctors: doctorsCount,
    patients: patientsCount,
    appointments: appointments.length,
    latestAppointments: appointments.reverse(),
  };
};
