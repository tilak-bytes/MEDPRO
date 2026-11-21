import React from "react";
import { useNavigate } from "react-router-dom";

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => {
        navigate(`/appointment/${doctor._id}`);
        window.scrollTo(0, 0); // Added window. for browser compatibility
      }}
      /* Added 'group' class here so child animations work */
      className={`group bg-[#F7F4ED] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer transition-all duration-500 border border-[#1A2B4C]/5 hover:border-[#C19A6B]/40 ${
        doctor.available ? "opacity-100" : "opacity-70"
      }`}
    >
      {/* Image */}
      <div className="w-full h-48 bg-[#E6F0ED] flex items-center justify-center">
        <img
          className="h-full object-cover"
          src={doctor.image}
          alt={doctor.name}
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        
        {/* Availability */}
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              doctor.available ? "bg-green-500" : "bg-gray-400"
            }`}
          ></span>
          <p
            className={`font-medium ${
              doctor.available ? "text-green-600" : "text-gray-400"
            }`}
          >
            {doctor.available ? "Available" : "Not Available"}
          </p>
        </div>
        <p className="text-[#1A2B4C] text-lg font-bold leading-tight group-hover:text-[#C19A6B] transition-colors">
          {doctor.name}
        </p>

        {/* Speciality - Muted Slate */}
        <p className="text-[#475467] text-sm font-medium italic">
          {doctor.speciality}
        </p>

        {/* Subtle Decorative Element */}
        <div className="pt-2">
           <span className="inline-block w-8 h-[2px] bg-[#C19A6B]/20 group-hover:w-full transition-all duration-500"></span>
        </div>
        
      </div>
    </div>
  );
};

export default DoctorCard;
