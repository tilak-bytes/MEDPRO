import { useContext, useState } from "react";
import { AdminContext } from "../context/AdminContext";

const DoctorCard = ({ doctor }) => {
  const { changeAvailability } = useContext(AdminContext);
  const [isChanging, setIsChanging] = useState(false);

  const handleAvailabilityChange = async () => {
    if (isChanging) return;
    setIsChanging(true);
    await changeAvailability(doctor._id);
    setIsChanging(false);
  };

  return (
    <div className="bg-white border-2 border-[#E9E9E9] rounded-2xl overflow-hidden cursor-pointer group hover:shadow-lg hover:border-[#0E5A4F] transition-all duration-300 flex flex-col h-full">
      <div className="overflow-hidden h-48 sm:h-56 bg-[#F5F1E8]">
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={doctor.image}
          alt={doctor.name}
        />
      </div>
      <div className="p-4 md:p-5 flex-1 flex flex-col gap-3">
        <div>
          <p className="text-[#1A2B4C] text-base md:text-lg font-semibold">{doctor.name}</p>
          <p className="text-[#0E5A4F] text-xs md:text-sm font-medium">{doctor.speciality}</p>
        </div>
        <div className={`flex items-center gap-2 pt-2 border-t border-[#E9E9E9] ${isChanging ? 'opacity-50' : ''}`}>
          <input 
            id={`availability-${doctor._id}`}
            onChange={handleAvailabilityChange} 
            type="checkbox" 
            checked={doctor.available}
            disabled={isChanging}
            className={`w-4 h-4 accent-[#0E5A4F] ${isChanging ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          />
          <label 
            htmlFor={`availability-${doctor._id}`}
            className={`text-[#475467] text-sm font-medium ${isChanging ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {isChanging ? "Updating..." : "Available"}
          </label>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
