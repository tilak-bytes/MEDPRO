import { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";

const DoctorDashboard = () => {
  const {
    dToken,
    dashData,
    getDashData,
    completeAppointment,
    cancelAppointment,
  } = useContext(DoctorContext);
  const { currencySymbol, formatDateString } = useContext(AppContext);

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
      getDashData();
      const intervalId = setInterval(() => getDashData(), 10000); // 10s polling
      return () => clearInterval(intervalId);
    }
  }, [dToken]);

  return (
    dashData && (
      <div className="p-6 md:p-10 bg-[#FDFBF7] min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1A2B4C]">
            Doctor <span className="text-[#0E5A4F]">Dashboard</span>
          </h1>
          <p className="text-[#475467] text-sm mt-2">Welcome back! Here's your overview</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-10">
          <div className="flex items-center gap-3 md:gap-4 bg-white p-4 md:p-6 rounded-2xl border-2 border-[#E9E9E9] hover:shadow-lg hover:border-[#0E5A4F] transition-all cursor-pointer">
            <div className="bg-[#0E5A4F]/10 p-2 md:p-3 rounded-lg flex-shrink-0">
              <img className="w-8 h-8 md:w-10 md:h-10" src={assets.earning_icon} alt="Earnings" />
            </div>
            <div className="min-w-0">
              <p className="text-lg md:text-2xl font-bold text-[#1A2B4C]">
                {currencySymbol} {dashData.earning}
              </p>
              <p className="text-[#0E5A4F] font-semibold text-xs md:text-sm">Total <span className="text-[#1A2B4C]">Earnings</span></p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4 bg-white p-4 md:p-6 rounded-2xl border-2 border-[#E9E9E9] hover:shadow-lg hover:border-[#0E5A4F] transition-all cursor-pointer">
            <div className="bg-[#0E5A4F]/10 p-2 md:p-3 rounded-lg flex-shrink-0">
              <img className="w-8 h-8 md:w-10 md:h-10" src={assets.appointment_icon} alt="Appointments" />
            </div>
            <div className="min-w-0">
              <p className="text-lg md:text-2xl font-bold text-[#1A2B4C]">
                {dashData.appointments}
              </p>
              <p className="text-[#0E5A4F] font-semibold text-xs md:text-sm">Total <span className="text-[#1A2B4C]\">Appointments</span></p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4 bg-white p-4 md:p-6 rounded-2xl border-2 border-[#E9E9E9] hover:shadow-lg hover:border-[#0E5A4F] transition-all cursor-pointer">
            <div className="bg-[#0E5A4F]/10 p-2 md:p-3 rounded-lg flex-shrink-0">
              <img className="w-8 h-8 md:w-10 md:h-10" src={assets.patients_icon} alt="Patients" />
            </div>
            <div className="min-w-0">
              <p className="text-lg md:text-2xl font-bold text-[#1A2B4C]">
                {dashData.patients}
              </p>
              <p className="text-[#0E5A4F] font-semibold text-xs md:text-sm">Total <span className="text-[#1A2B4C]\">Patients</span></p>
            </div>
          </div>
        </div>

        {/* Latest Appointments */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E9E9E9] overflow-hidden">
          <div className="flex items-center gap-3 px-4 md:px-6 py-4 md:py-5 bg-[#F5F1E8] border-b border-[#E9E9E9]">
            <img src={assets.list_icon} alt="Appointments" className="w-5 h-5" />
            <p className="font-bold text-[#1A2B4C] text-sm md:text-lg">Latest <span className="text-[#0E5A4F]\">Appointments</span></p>
          </div>
          <div className="divide-y divide-[#E9E9E9]">
            {dashData.latestAppointments.map((item, index) => (
              <div
                className="flex flex-col sm:flex-row items-start sm:items-center px-4 md:px-6 py-3 md:py-4 gap-3 sm:gap-4 hover:bg-[#FDFBF7] transition-all"
                key={index}
              >
                <img
                  className="rounded-full w-10 h-10 md:w-12 md:h-12 object-cover border-2 border-[#E9E9E9] flex-shrink-0"
                  src={item.userData.image}
                  alt={item.userData.name}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[#1A2B4C] font-semibold text-sm md:text-base">
                    {item.userData.name}
                  </p>
                  <p className="text-[#475467] text-xs md:text-sm">
                    {formatDateString(item.slotDate)}
                  </p>
                </div>
                {item.cancelled ? (
                  <p className="text-red-500 text-xs font-bold bg-red-50 px-2 md:px-3 py-1 rounded-full flex-shrink-0">Cancelled</p>
                ) : item.isCompleted ? (
                  <p className="text-green-600 text-xs font-bold bg-green-50 px-2 md:px-3 py-1 rounded-full flex-shrink-0">
                    Completed
                  </p>
                ) : (
                  <div className="flex gap-2 flex-shrink-0">
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
      </div>
    )
  );
};

export default DoctorDashboard;
