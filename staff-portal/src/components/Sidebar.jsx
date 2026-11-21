import { useContext } from "react";
import { AdminContext } from "../context/AdminContext";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";
import { DoctorContext } from "../context/DoctorContext";

const adminNavLinks = [
  { to: "/admin/dashboard", icon: assets.home_icon, label: "Dashboard" },
  {
    to: "/admin/all-appointments",
    icon: assets.appointment_icon,
    label: "All Appointments",
  },
  { to: "/admin/add-doctor", icon: assets.add_icon, label: "Add Doctor" },
  { to: "/admin/doctors-list", icon: assets.home_icon, label: "Doctor List" },
  { to: "/admin/doctor-updates", icon: assets.people_icon, label: "Profile Requests" },
];

const doctorNavLinks = [
  { to: "/doctor/dashboard", icon: assets.home_icon, label: "Dashboard" },
  {
    to: "/doctor/appointments",
    icon: assets.appointment_icon,
    label: "My Appointments",
  },
  { to: "/doctor/profile", icon: assets.people_icon, label: "Profile" },
];

const Sidebar = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);
  return (
    <div className="max-h-[calc(100vh-64px)] md:max-h-screen bg-[#FDFBF7] border-r border-[#E9E9E9] sticky top-16 md:sticky md:top-0 overflow-hidden">
      {(aToken || dToken) && (
        <ul className="text-[#475467] mt-2 md:mt-4">
          {(aToken ? adminNavLinks : doctorNavLinks).map(
            ({ to, icon, label }) => (
              <NavLink
                className={({ isActive }) =>
                  `flex items-center gap-2 md:gap-4 py-3 md:py-3.5 px-3 md:px-4 lg:px-8 md:min-w-60 lg:min-w-72 cursor-pointer transition-all mx-2 md:mx-3 rounded-lg ${
                    isActive 
                      ? "bg-[#0E5A4F]/15 text-[#0E5A4F] font-semibold border-l-4 border-[#0E5A4F]" 
                      : "hover:bg-[#0E5A4F]/5 text-[#1A2B4C] opacity-75"
                  }`
                }
                key={to}
                to={to}
              >
                <img src={icon} alt={label} className="w-5 h-5 flex-shrink-0" />
                <p className="hidden md:block text-xs md:text-sm font-medium">{label}</p>
              </NavLink>
            )
          )}
        </ul>
      )}
    </div>
  );
};

export default Sidebar;
