import { useContext } from "react";
import { assets } from "../assets/assets";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";

const Navbar = () => {
  const { aToken, setAToken } = useContext(AdminContext);
  const { setDToken } = useContext(DoctorContext);

  const logoutHandler = () => {
    // Admin logout
    setAToken("");
    localStorage.removeItem("aToken");

    // Doctor logout
    setDToken("");
    localStorage.removeItem("dToken");
  };
  return (
    <div className="flex justify-between items-center px-4 md:px-6 lg:px-10 py-3 md:py-4 border-b border-[#E9E9E9] bg-[#F5F1E8] shadow-sm sticky top-0 z-40">
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <img
          className="w-24 sm:w-32 md:w-40 cursor-pointer flex-shrink-0"
          src={assets.admin_logo}
          alt="Logo"
        />
        <div className="px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-[#0E5A4F] flex-shrink-0">
          <p className="text-xs md:text-xs font-semibold text-white whitespace-nowrap">
            {aToken ? "Admin" : "Doctor"}
          </p>
        </div>
      </div>
      <button
        onClick={logoutHandler}
        className="cursor-pointer bg-[#0E5A4F] hover:bg-[#0c4a3f] text-white text-xs md:text-sm px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-semibold transition-all flex-shrink-0"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
