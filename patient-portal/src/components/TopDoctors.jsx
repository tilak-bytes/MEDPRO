import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import DoctorCard from "./DoctorCard";

const TopDoctors = () => {
  const navigate = useNavigate();
  const { doctors, getDoctorsData } = useContext(AppContext);

  useEffect(() => {
    getDoctorsData();
  }, []);

  return (
    <div className="px-0 py-0">
      
      {/* Heading */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-semibold text-[#1A2B4C]">
          Top Doctors to Book
        </h1>
        <p className="text-[#475467] mt-3 max-w-2xl mx-auto text-sm md:text-base">
          Meet our most <span className="text-[#0E5A4F] font-semibold">experienced</span> and highly-rated <span className="text-[#0E5A4F] font-semibold">professionals</span>.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {doctors.slice(0, 10).map((doctor, index) => (
          <DoctorCard key={index} doctor={doctor} />
        ))}
      </div>

      {/* Button */}
      <div className="flex justify-center mt-12">
        <button
          onClick={() => {
            navigate("/doctors");
            setTimeout(() => {
              scrollTo(0, 0);
            }, 50);
          }}
          className="bg-[#0E5A4F] text-white px-8 py-3 rounded-full shadow-md hover:bg-[#0c4a3f] transition-all duration-300 font-semibold"
        >
          Explore All Doctors
        </button>
      </div>
    </div>
  );
};

export default TopDoctors;
