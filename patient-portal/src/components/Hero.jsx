import { assets } from "../assets/assets";

const Hero = ({ userName }) => {
  return (
    <div className="bg-[#F5F1E8] py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col-reverse md:flex-row items-center gap-10">

        {/* ---------- LEFT ---------- */}
        <div className="md:w-1/2 text-center md:text-left flex flex-col gap-6">

          {userName && (
            <p className="text-[#0E5A4F] font-semibold text-base md:text-lg">
              Welcome back, <span className="text-[#1A2B4C] font-bold">{userName}</span>! 
            </p>
          )}

          <h1 className="text-3xl md:text-5xl font-semibold text-[#1A2B4C] leading-tight">
            Your <span className="text-[#0E5A4F]">Health</span>,
            <span className="block text-[#0E5A4F]">
              Our Priority
            </span>
          </h1>

          <p className="text-[#475467] text-sm md:text-base max-w-md mx-auto md:mx-0">
            Book appointments with <span className="text-[#0E5A4F] font-semibold">experienced doctors</span> in just a few clicks.
            Get <span className="text-[#0E5A4F] font-semibold">trusted healthcare</span> support anytime, anywhere.
          </p>

          <div className="flex items-center justify-center md:justify-start gap-3">
            <img className="w-24" src={assets.group_profiles} alt="" />
            <span className="text-sm text-[#475467]">
              Trusted by thousands of patients
            </span>
          </div>

          <div className="flex justify-center md:justify-start">
            <a
              href="#speciality"
              className="bg-[#0E5A4F] text-white px-6 py-3 rounded-full shadow-md hover:bg-[#0c4a3f] transition"
            >
              Explore Doctors →
            </a>
          </div>
        </div>

        {/* ---------- RIGHT ---------- */}
        <div className="md:w-1/2 flex justify-center">
          <img
            className="w-full max-w-md md:max-w-lg rounded-xl"
            src={assets.header_img}
            alt=""
          />
        </div>

      </div>
    </div>
  );
};

export default Hero;
