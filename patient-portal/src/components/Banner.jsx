import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";

const Banner = () => {
  const navigate = useNavigate();
  const { token } = useContext(AppContext);

  return (
    <div className="flex flex-col md:flex-row items-center bg-[#F5F1E8] rounded-2xl px-6 sm:px-10 md:px-14 lg:px-16 my-20 md:mx-10 shadow-sm hover:shadow-lg transition-all duration-300">
      
      {/* ---------- Left Side ---------- */}
      <div className="flex-1 py-10 md:py-14 lg:py-16">
        
        {/* Simple Heading */}
        <div className="text-[#1A2B4C] text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight">
          <p>Find the Right <span className="text-[#0E5A4F]">Doctor</span></p>
          <p className="mt-2 text-[#0E5A4F]">
            Book your <span className="text-[#1A2B4C]">appointment</span> easily
          </p>
        </div>

        {/* Button */}
        {!token && (
          <button
            onClick={() => {
              navigate("/login");
              scrollTo(0, 0);
            }}
            className="mt-6 px-7 py-2.5 rounded-full bg-[#0E5A4F] text-white text-sm shadow-sm hover:bg-[#0c4a3f] transition-all"
          >
            Create Account
          </button>
        )}
      </div>

      {/* ---------- Right Side ---------- */}
      <div className="hidden md:flex md:w-1/2 justify-end">
        <img
          className="max-w-sm w-full object-contain"
          src={assets.appointment_img}
          alt=""
        />
      </div>
    </div>
  );
};

export default Banner;
