import { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import DoctorCard from "../../components/DoctorCard";

const DoctorsList = () => {
  const { doctors, aToken, getAllDoctors } = useContext(AdminContext);

  useEffect(() => {
    if (aToken) {
      getAllDoctors();
    }
  }, [aToken]);

  return (
    <div className="p-6 md:p-10 bg-[#FDFBF7] min-h-screen max-h-[90vh] overflow-y-scroll">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-[#1A2B4C]">
          All <span className="text-[#0E5A4F]">Doctors</span>
        </h1>
        <p className="text-[#475467] text-sm mt-2">Manage your healthcare professionals</p>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {doctors.map((doctor, index) => (
          <DoctorCard key={index} doctor={doctor} />
        ))}
      </div>
    </div>
  );
};

export default DoctorsList;
