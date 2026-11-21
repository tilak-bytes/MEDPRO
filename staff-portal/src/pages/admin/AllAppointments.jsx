import { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";


const AllAppointments = () => {
  const { aToken, appointments, getAllAppointments, cancelAppointment } =
    useContext(AdminContext);
  const { currencySymbol, calculateAge, formatDateString } =
    useContext(AppContext);

  const [cancellingId, setCancellingId] = useState(null);

  const handleCancel = async (id) => {
    if (cancellingId) return;
    setCancellingId(id);
    await cancelAppointment(id);
    setCancellingId(null);
  };

  useEffect(() => {
    if (aToken) {
      getAllAppointments();
      const intervalId = setInterval(() => getAllAppointments(), 10000); // 10s polling
      return () => clearInterval(intervalId);
    }
  }, [aToken]);
  return (
    <div className="w-full max-w-7xl mx-auto p-6 md:p-10 bg-[#FDFBF7] min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-[#1A2B4C]">
          All <span className="text-[#0E5A4F]">Appointments</span>
        </h1>
        <p className="text-[#475467] text-sm mt-2">Manage all patient appointments</p>
      </div>

      <div className="bg-white border border-[#E9E9E9] rounded-2xl shadow-sm text-sm min-h-[60vh] max-h-[80vh] overflow-x-auto">
        <div className="hidden md:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr_1fr] gap-4 py-4 px-4 md:px-6 bg-[#F5F1E8] border-b border-[#E9E9E9] font-semibold text-[#1A2B4C] sticky top-0">
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Payment</p>
          <p>Actions</p>
        </div>
        {[...appointments].reverse().map((item, index) => (
          <div
            key={index}
            className="flex flex-col md:grid md:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr_1fr] gap-3 md:gap-4 items-start md:items-center text-[#475467] py-4 px-4 md:px-6 border-b border-[#E9E9E9] hover:bg-[#FDFBF7] transition-all"
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
            <p className="text-xs md:text-base font-semibold md:font-normal">{calculateAge(item.userData.dob)}</p>
            <p className="text-sm md:text-base">
              {formatDateString(item.slotDate)}, <span className="font-semibold">{item.slotTime}</span>
            </p>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <img
                className="w-10 h-10 rounded-full object-cover border-2 border-[#E9E9E9] flex-shrink-0"
                src={item.docData.image}
                alt={item.docData.name}
              />
              <p className="font-semibold text-[#1A2B4C] text-sm md:text-base">{item.docData.name}</p>
            </div>
            <p className="font-bold text-[#0E5A4F]">
              {currencySymbol}
              {item.docData.fees}
            </p>
            <p
              className={`text-xs w-fit px-2 md:px-3 py-1 md:py-1.5 rounded-full font-semibold ${
                item.payment
                  ? "bg-green-50 text-green-600 border border-green-200"
                  : "text-[#0E5A4F] border border-[#0E5A4F] bg-[#0E5A4F]/5"
              }`}
            >
              {item.payment ? "ONLINE" : "CASH"}
            </p>

            {item.cancelled ? (
              <p className="text-red-500 text-xs font-bold bg-red-50 px-2 md:px-3 py-1 rounded-full w-fit">Cancelled</p>
            ) : item.isCompleted ? (
              <p className="text-green-600 text-xs font-bold bg-green-50 px-2 md:px-3 py-1 rounded-full w-fit">Completed</p>
            ) : (
              <button
                onClick={() => handleCancel(item._id)}
                disabled={cancellingId === item._id}
                className={`px-2 md:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all w-full md:w-auto ${
                  cancellingId === item._id
                    ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                    : "bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 cursor-pointer"
                }`}
              >
                {cancellingId === item._id ? "Cancelling..." : "Cancel"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllAppointments;
