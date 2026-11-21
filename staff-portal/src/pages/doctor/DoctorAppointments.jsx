import { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";

const DoctorAppointments = () => {
  const { dToken, appointments, getAppointments, cancelAppointment, completeAppointment } = useContext(DoctorContext);
  const { currencySymbol, calculateAge, formatDateString } =
    useContext(AppContext);

  const [processingId, setProcessingId] = useState(null);

  const handleCancel = async (id) => {
    if (processingId) return;
    setProcessingId(id);
    await cancelAppointment(id);
    setProcessingId(null);
  };

  const handleComplete = async (id) => {
    if (processingId) return;
    setProcessingId(id);
    await completeAppointment(id);
    setProcessingId(null);
  };

  useEffect(() => {
    if (dToken) {
      getAppointments();
      const intervalId = setInterval(() => getAppointments(), 10000); // 10s polling
      return () => clearInterval(intervalId);
    }
  }, [dToken]);

  return (
    <div className="w-full p-6 md:p-10 bg-[#FDFBF7] min-h-screen max-h-[90vh] overflow-y-scroll">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1A2B4C]">
          My <span className="text-[#0E5A4F]">Appointments</span>
        </h1>
        <p className="text-[#475467] text-sm mt-2">Manage your patient appointments</p>
      </div>

      <div className="bg-white border border-[#E9E9E9] rounded-2xl shadow-sm text-sm min-h-[60vh] overflow-x-auto">
        <div className="hidden md:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-4 py-4 px-4 md:px-6 bg-[#F5F1E8] border-b border-[#E9E9E9] font-semibold text-[#1A2B4C] sticky top-0">
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Actions</p>
        </div>
        {appointments.map((item, index) => (
          <div
            key={index}
            className="flex flex-col md:grid md:grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-3 md:gap-4 items-start md:items-center text-[#475467] py-4 px-4 md:px-6 border-b border-[#E9E9E9] hover:bg-[#FDFBF7] transition-all"
          >
            <p className="hidden md:block font-semibold text-[#1A2B4C]">{index + 1}</p>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <img
                className="w-10 h-10 rounded-full object-cover border-2 border-[#E9E9E9] flex-shrink-0"
                src={item.userData.image}
                alt={item.userData.name}
              />
              <p className="font-semibold text-[#1A2B4C] text-sm md:text-base">{item.userData.name}</p>
            </div>
            <p
              className={`text-xs w-fit px-2 md:px-3 py-1 md:py-1.5 rounded-full font-semibold ${
                item.payment
                  ? "bg-green-50 text-green-600 border border-green-200"
                  : "text-[#0E5A4F] border border-[#0E5A4F] bg-[#0E5A4F]/5"
              }`}
            >
              {item.payment ? "ONLINE" : "CASH"}
            </p>
            <p className="hidden md:block text-sm">{calculateAge(item.userData.dob)}</p>
            <p className="text-sm md:text-base">
              {formatDateString(item.slotDate)}, <span className="font-semibold">{item.slotTime}</span>
            </p>
            <p className="font-bold text-[#0E5A4F]">
              {currencySymbol}
              {item.amount}
            </p>

            {item.cancelled ? (
              <p className="text-red-500 text-xs font-bold bg-red-50 px-2 md:px-3 py-1 rounded-full w-fit">Cancelled</p>
            ) : item.isCompleted ? (
              <p className="text-green-600 text-xs font-bold bg-green-50 px-2 md:px-3 py-1 rounded-full w-fit">Completed</p>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => handleCancel(item._id)}
                  disabled={processingId === item._id}
                  className={`p-1.5 md:p-2 rounded-lg transition-all flex items-center justify-center ${
                    processingId === item._id
                      ? "bg-gray-100 border border-gray-200 cursor-not-allowed opacity-50"
                      : "bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 cursor-pointer"
                  }`}
                >
                  <img
                    className="w-4 h-4 md:w-5 md:h-5"
                    src={assets.cancel_icon}
                    alt="Cancel"
                  />
                </button>
                <button
                  onClick={() => handleComplete(item._id)}
                  disabled={processingId === item._id}
                  className={`p-1.5 md:p-2 rounded-lg transition-all flex items-center justify-center ${
                    processingId === item._id
                      ? "bg-gray-100 border border-gray-200 cursor-not-allowed opacity-50"
                      : "bg-green-50 hover:bg-green-100 border border-green-200 text-green-600 cursor-pointer"
                  }`}
                >
                  <img
                    className="w-4 h-4 md:w-5 md:h-5"
                    src={assets.tick_icon}
                    alt="Complete"
                  />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorAppointments;
