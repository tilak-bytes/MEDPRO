import { assets } from "../assets/assets";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="bg-[#F7F4ED] border-t border-[#1A2B4C]/10 mt-12 px-6 md:px-10 lg:px-16">
      
      {/* Main Section */}
      <div className="mx-auto max-w-[1300px] grid grid-cols-1 md:grid-cols-4 gap-12 py-16">
        
        {/* ---------- Section 01 ---------- */}
        <div className="md:col-span-2">
          <img className="mb-6 w-36" src={assets.logo} alt="logo" />

          <p className="text-[#475467] text-[15px] leading-7 max-w-md">
            <span className="text-[#0E5A4F] font-semibold">MEDPRO</span> helps you easily connect with <span className="text-[#0E5A4F] font-semibold">trusted doctors</span> and manage
            your appointments without stress. Simple, reliable healthcare at
            your fingertips.
          </p>
        </div>

        {/* ---------- Section 02 ---------- */}
        <div>
          <p className="text-[13px] text-[#0E5A4F] font-bold mb-5 uppercase tracking-wider">
            <span className="text-[#C19A6B]">→</span> Company
          </p>

          <ul className="flex flex-col gap-3 text-[15px] text-[#475467]">
            <li>
              <Link to="/" className="inline-block cursor-pointer transition-all duration-300 hover:text-[#C19A6B] hover:translate-x-2">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="inline-block cursor-pointer transition-all duration-300 hover:text-[#C19A6B] hover:translate-x-2">
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" className="inline-block cursor-pointer transition-all duration-300 hover:text-[#C19A6B] hover:translate-x-2">
                Contact
              </Link>
            </li>
            <li>
              <span className="inline-block cursor-pointer transition-all duration-300 hover:text-[#C19A6B] hover:translate-x-2">
                Privacy Policy
              </span>
            </li>
          </ul>
        </div>

        {/* ---------- Section 03 ---------- */}
        <div>
          <p className="text-[13px] text-[#0E5A4F] font-bold mb-5 uppercase tracking-wider">
            <span className="text-[#C19A6B]">✓</span> Contact
          </p>

          <ul className="flex flex-col gap-3 text-[15px] text-[#475467]">
            <li className="inline-block cursor-pointer transition-all duration-300 hover:text-[#C19A6B] hover:translate-x-2">
              +1 (800) 555-0199
            </li>
            <li className="inline-block cursor-pointer transition-all duration-300 hover:text-[#C19A6B] hover:translate-x-2">
              support@medpro.health
            </li>
          </ul>

          <p className="mt-4 text-xs text-gray-400">
            Available for patient support
          </p>
        </div>
      </div>

      {/* ---------- Bottom ---------- */}
      <div className="mx-auto max-w-[1300px] border-t border-[#1A2B4C]/10 py-6 text-center text-[14px] text-[#475467]">
        © {new Date().getFullYear()}{" "}
        <span className="text-[#1A2B4C] font-medium">MEDPRO</span>. All rights reserved.
      </div>
    </div>
  );
};

export default Footer;
