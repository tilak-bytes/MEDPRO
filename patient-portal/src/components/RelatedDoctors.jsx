import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import DoctorCard from "./DoctorCard";

const RelatedDoctors = ({ docId, speciality }) => {
  const [relDoc, setRelDoc] = useState([]);
  const { doctors, getDoctorsData } = useContext(AppContext);

  useEffect(() => {
    getDoctorsData();
  }, []);

  useEffect(() => {
    if (doctors.length > 0 && speciality) {
      const doctorsData = doctors.filter(
        (doc) => doc.speciality === speciality && doc._id !== docId
      );
      setRelDoc(doctorsData);
    }
  }, [doctors, speciality, docId]);

  return (
    relDoc.length > 0 && (
      <div className="flex flex-col items-center gap-6 my-20">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1A2B4C]">Related <span className="text-[#0E5A4F]">Doctors</span></h1>
          <p className="text-[#475467] mt-3 max-w-2xl mx-auto text-sm md:text-base">
            Other experienced doctors in the same <span className="text-[#0E5A4F] font-semibold">speciality</span>.
          </p>
        </div>
        <div className="w-full grid grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] gap-6 pt-5 px-3 sm:px-0">
          {relDoc.slice(0, 5).map((doctor, index) => (
            <DoctorCard key={index} doctor={doctor} />
          ))}
        </div>
      </div>
    )
  );
};

export default RelatedDoctors;
