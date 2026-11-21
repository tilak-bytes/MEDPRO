import { assets } from "../assets/assets";

const Contact = () => {
  return (
    <div className="bg-[#FDFBF7] min-h-screen py-10">
      {/* Header Section */}
      <div className="text-center py-6">
        <h1 className="text-3xl md:text-4xl font-bold text-[#1A2B4C] mb-2">
          Contact <span className="text-[#0E5A4F]">Us</span>
        </h1>
        <p className="text-[#475467] text-sm max-w-xl mx-auto">
          Have questions? We're here to help you. <span className="text-[#0E5A4F] font-semibold">Connect with us</span> anytime
        </p>
      </div>

      {/* Contact Info Section */}
      <div className="my-8 flex flex-col md:flex-row gap-8 items-center">
        <img
          className="w-full md:max-w-[350px] rounded-2xl shadow-lg"
          src={assets.contact_image}
          alt="Contact MEDPRO"
        />
        <div className="flex flex-col justify-center gap-6 md:w-1/2">
          <div>
            <h2 className="text-2xl font-bold text-[#1A2B4C] mb-3">
              Our <span className="text-[#0E5A4F]">Location</span>
            </h2>
            <p className="text-[#475467] text-sm leading-7">
              Find us at our main headquarters in <span className="text-[#0E5A4F] font-semibold">Medical Center Plaza, Tech Corridor</span>. We are dedicated to providing accessible healthcare coordination. Reach out to schedule a consultation or visit during business hours.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#1A2B4C] mb-2">
              Get in <span className="text-[#0E5A4F]">Contact</span>
            </h3>
            <div className="space-y-3">
              <p className="text-[#475467] text-sm">
                <span className="font-semibold text-[#1A2B4C]">Email:</span> contact@medpro.health
              </p>
              <p className="text-[#475467] text-sm">
                <span className="font-semibold text-[#1A2B4C]">Phone:</span> +1 (800) 555-0199
              </p>
              <p className="text-[#475467] text-sm">
                <span className="font-semibold text-[#1A2B4C]">Hours:</span> Mon - Fri: 9AM - 6PM
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Careers Section */}
      <div className="bg-gradient-to-r from-[#0E5A4F]/10 to-[#C19A6B]/10 rounded-2xl border-2 border-[#0E5A4F]/20 p-8 my-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1A2B4C] mb-4">
            Join Our <span className="text-[#0E5A4F]">Growing Team</span>
          </h2>
          <p className="text-[#475467] text-sm leading-7 mb-8">
            We're seeking <span className="text-[#0E5A4F] font-semibold">passionate healthcare professionals</span> and tech experts to revolutionize patient care. Be part of a mission that makes a real difference in people's lives every day.
          </p>
          <button className="cursor-pointer bg-[#0E5A4F] hover:bg-[#0c4a3f] text-white text-sm font-semibold px-8 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg">
            Explore Careers
          </button>
        </div>
      </div>
    </div>
  );
};

export default Contact;
