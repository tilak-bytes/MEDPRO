import { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";

const Dashboard = () => {
  const { aToken, cancelAppointment, dashData, getDashData } =
    useContext(AdminContext);
  const { formatDateString } = useContext(AppContext);
  const [appointmentLimit, setAppointmentLimit] = useState("5");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cancellingId, setCancellingId] = useState(null);

  const handleCancel = async (id) => {
    if (cancellingId) return;
    setCancellingId(id);
    await cancelAppointment(id);
    setCancellingId(null);
  };

  useEffect(() => {
    if (aToken) {
      getDashData();
      const intervalId = setInterval(() => getDashData(), 10000); // 10s polling
      return () => clearInterval(intervalId);
    }
  }, [aToken]);

  // Calculate appointment statistics
  const getAppointmentStats = () => {
    if (!dashData?.latestAppointments) return { pending: 0, completed: 0, cancelled: 0 };
    
    return dashData.latestAppointments.reduce(
      (acc, apt) => {
        if (apt.cancelled) acc.cancelled++;
        else if (apt.isCompleted) acc.completed++;
        else acc.pending++;
        return acc;
      },
      { pending: 0, completed: 0, cancelled: 0 }
    );
  };

  const appointmentStats = getAppointmentStats();

  const totalAppointments = dashData?.latestAppointments?.length || 0;
  
  // Filter by status first
  let filteredByStatus = dashData?.latestAppointments || [];
  if (statusFilter === "pending") {
    filteredByStatus = filteredByStatus.filter(apt => !apt.cancelled && !apt.isCompleted);
  } else if (statusFilter === "completed") {
    filteredByStatus = filteredByStatus.filter(apt => apt.isCompleted);
  } else if (statusFilter === "cancelled") {
    filteredByStatus = filteredByStatus.filter(apt => apt.cancelled);
  }
  
  // Then filter by limit
  const displayedAppointments = appointmentLimit === "all"
    ? filteredByStatus
    : filteredByStatus.slice(0, Number(appointmentLimit));

  return (
    dashData && (
      <div className="p-6 md:p-10 bg-[#FDFBF7] min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1A2B4C]">
            Admin <span className="text-[#0E5A4F]">Dashboard</span>
          </h1>
          <p className="text-[#475467] text-sm mt-2">Welcome back! Here's your overview</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-10">
          <div className="flex items-center gap-3 md:gap-4 bg-white p-4 md:p-6 rounded-2xl border-2 border-[#E9E9E9] min-w-0 hover:shadow-lg hover:border-[#0E5A4F] transition-all cursor-pointer">
            <div className="bg-[#0E5A4F]/10 p-2 md:p-3 rounded-lg flex-shrink-0">
              <img className="w-8 h-8 md:w-10 md:h-10" src={assets.doctor_icon} alt="Doctors" />
            </div>
            <div className="min-w-0">
              <p className="text-lg md:text-2xl font-bold text-[#1A2B4C]">
                {dashData.doctors}
              </p>
              <p className="text-[#0E5A4F] font-semibold text-xs md:text-sm">Total <span className="text-[#1A2B4C]">Doctors</span></p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4 bg-white p-4 md:p-6 rounded-2xl border-2 border-[#E9E9E9] min-w-0 hover:shadow-lg hover:border-[#0E5A4F] transition-all cursor-pointer">
            <div className="bg-[#0E5A4F]/10 p-2 md:p-3 rounded-lg flex-shrink-0">
              <img className="w-8 h-8 md:w-10 md:h-10" src={assets.appointment_icon} alt="Appointments" />
            </div>
            <div className="min-w-0">
              <p className="text-lg md:text-2xl font-bold text-[#1A2B4C]">
                {dashData.appointments}
              </p>
              <p className="text-[#0E5A4F] font-semibold text-xs md:text-sm">Total <span className="text-[#1A2B4C]">Appointments</span></p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4 bg-white p-4 md:p-6 rounded-2xl border-2 border-[#E9E9E9] min-w-0 hover:shadow-lg hover:border-[#0E5A4F] transition-all cursor-pointer">
            <div className="bg-[#0E5A4F]/10 p-2 md:p-3 rounded-lg flex-shrink-0">
              <img className="w-8 h-8 md:w-10 md:h-10" src={assets.patients_icon} alt="Patients" />
            </div>
            <div className="min-w-0">
              <p className="text-lg md:text-2xl font-bold text-[#1A2B4C]">
                {dashData.patients}
              </p>
              <p className="text-[#0E5A4F] font-semibold text-xs md:text-sm">Total <span className="text-[#1A2B4C]">Patients</span></p>
            </div>
          </div>
        </div>

        {/* Appointment Analytics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
          <div className="flex items-center gap-3 md:gap-4 bg-white p-4 md:p-6 rounded-2xl border-2 border-[#E9E9E9] min-w-0 hover:shadow-lg hover:border-[#0E5A4F] transition-all cursor-pointer">
            <div className="bg-blue-50 p-2 md:p-3 rounded-lg flex-shrink-0">
              <p className="text-2xl md:text-3xl">⏳</p>
            </div>
            <div className="min-w-0">
              <p className="text-2xl md:text-3xl font-bold text-blue-600">
                {appointmentStats.pending}
              </p>
              <p className="text-[#475467] font-semibold text-xs md:text-sm">Pending</p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4 bg-white p-4 md:p-6 rounded-2xl border-2 border-[#E9E9E9] min-w-0 hover:shadow-lg hover:border-[#0E5A4F] transition-all cursor-pointer">
            <div className="bg-green-50 p-2 md:p-3 rounded-lg flex-shrink-0">
              <p className="text-2xl md:text-3xl">✓</p>
            </div>
            <div className="min-w-0">
              <p className="text-2xl md:text-3xl font-bold text-green-600">
                {appointmentStats.completed}
              </p>
              <p className="text-[#475467] font-semibold text-xs md:text-sm">Completed</p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4 bg-white p-4 md:p-6 rounded-2xl border-2 border-[#E9E9E9] min-w-0 hover:shadow-lg hover:border-[#0E5A4F] transition-all cursor-pointer">
            <div className="bg-red-50 p-2 md:p-3 rounded-lg flex-shrink-0">
              <p className="text-2xl md:text-3xl">✕</p>
            </div>
            <div className="min-w-0">
              <p className="text-2xl md:text-3xl font-bold text-red-600">
                {appointmentStats.cancelled}
              </p>
              <p className="text-[#475467] font-semibold text-xs md:text-sm">Cancelled</p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4 bg-white p-4 md:p-6 rounded-2xl border-2 border-[#E9E9E9] min-w-0 hover:shadow-lg hover:border-[#0E5A4F] transition-all cursor-pointer">
            <div className="bg-[#C19A6B]/10 p-2 md:p-3 rounded-lg flex-shrink-0">
              <p className="text-2xl md:text-3xl">📊</p>
            </div>
            <div className="min-w-0">
              <p className="text-2xl md:text-3xl font-bold text-[#C19A6B]">
                {totalAppointments}
              </p>
              <p className="text-[#475467] font-semibold text-xs md:text-sm">Total</p>
            </div>
          </div>
        </div>

        {/* Latest Appointments */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E9E9E9] overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 md:px-6 py-4 md:py-5 bg-[#F5F1E8] border-b border-[#E9E9E9]">
            <div className="flex items-center gap-3">
              <img src={assets.list_icon} alt="Appointments" className="w-5 h-5" />
              <p className="font-bold text-[#1A2B4C] text-base md:text-lg">Recent <span className="text-[#0E5A4F]">Appointments</span></p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <label className="text-[#1A2B4C] font-semibold text-sm">Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border-2 border-[#E9E9E9] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0E5A4F] transition-all font-medium"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[#1A2B4C] font-semibold text-sm">Show:</label>
                <select
                  value={appointmentLimit}
                  onChange={(e) => setAppointmentLimit(e.target.value)
                  }
                  className="border-2 border-[#E9E9E9] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0E5A4F] transition-all font-medium"
                >
                  <option value="5">Last 5</option>
                  <option value="10">Last 10</option>
                  <option value="15">Last 15</option>
                  <option value="all">All ({totalAppointments})</option>
                </select>
              </div>
            </div>
          </div>
          <div className="divide-y divide-[#E9E9E9]">
            {displayedAppointments?.length > 0 ? (
              displayedAppointments.map((item, index) => (
                <div
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 md:px-6 py-4 md:py-5 gap-3 sm:gap-4 hover:bg-[#FDFBF7] transition-all"
                  key={index}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[#1A2B4C] font-semibold text-sm md:text-base">
                        {item.docData.name}
                      </p>
                      <span className="text-[#475467] text-xs">•</span>
                      <p className="text-[#475467] text-xs md:text-sm">
                        {formatDateString(item.slotDate)} {item.slotTime}
                      </p>
                    </div>
                    <p className="text-[#475467] text-xs md:text-sm">
                      Patient: <span className="font-semibold text-[#1A2B4C]">{item.userData.name}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    {item.cancelled ? (
                      <p className="text-red-500 text-xs font-bold bg-red-50 px-3 py-1.5 rounded-full flex-1 sm:flex-initial text-center">
                        ✕ Cancelled
                      </p>
                    ) : item.isCompleted ? (
                      <p className="text-green-600 text-xs font-bold bg-green-50 px-3 py-1.5 rounded-full flex-1 sm:flex-initial text-center">
                        ✓ Completed
                      </p>
                    ) : (
                      <button
                        onClick={() => handleCancel(item._id)}
                        disabled={cancellingId === item._id}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex-1 sm:flex-initial ${
                          cancellingId === item._id
                            ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                            : "bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 cursor-pointer"
                        }`}
                      >
                        {cancellingId === item._id ? "Cancelling..." : "Cancel"}
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 md:px-6 py-8 text-center">
                <p className="text-[#475467] text-sm">No appointments found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default Dashboard;