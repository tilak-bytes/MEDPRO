import { useNavigate } from "react-router-dom";
import { specialityData } from "../assets/assets";

const SpecialityMenu = () => {
  const navigate = useNavigate();

  return (
    <div
      id="speciality"
      className="px-0 py-0"
    >
      {/* Heading */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-semibold text-[#1A2B4C]">
          Find by Speciality
        </h1>
        <p className="text-[#475467] mt-3 max-w-2xl mx-auto text-sm md:text-base">
          Select your required <span className="text-[#0E5A4F] font-semibold">specialty</span> to discover experienced <span className="text-[#0E5A4F] font-semibold">doctors</span> in that field.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
        {specialityData.map((item, index) => (
          <div
            key={index}
            onClick={() => {
              navigate(`/doctors/${item.slug}`);
              setTimeout(() => {
                scrollTo(0, 0);
              }, 100);
            }}
            className="bg-white rounded-xl shadow-sm hover:shadow-md p-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:-translate-y-2 group"
          >
            {/* Icon */}
            <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center bg-[#E6F0ED] rounded-full mb-3 group-hover:bg-[#0E5A4F] transition-all duration-300">
              <img
                className="w-8 md:w-10 group-hover:scale-110 transition"
                src={item.image}
                alt=""
              />
            </div>

            {/* Text */}
            <p className="text-xs md:text-sm text-[#475467] text-center group-hover:text-[#0E5A4F] font-medium transition-colors">
              {item.speciality}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpecialityMenu;
