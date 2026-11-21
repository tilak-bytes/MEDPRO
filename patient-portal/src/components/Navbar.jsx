import { Link, NavLink, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useState, useRef, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";

const navLinks = [
  { title: "Home", path: "/" },
  { title: "All Doctors", path: "/doctors" },
  { title: "About", path: "/about" },
  { title: "Contact", path: "/contact" },
];

const Navbar = () => {
  const navigate = useNavigate();


  const { token, setToken, userData } = useContext(AppContext);
  const [showMenu, setShowMenu] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const logoutFunc = () => {
    setToken(false);
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-between text-md px-6 py-4 mb-6 bg-[#F5F1E8] shadow-sm sticky top-0 z-50">
      
      {/* Logo */}
      <Link to="/">
        <img className="w-40 cursor-pointer" src={assets.logo} alt="" />
      </Link>

      {/* Desktop Menu */}
      <ul className="hidden md:flex items-center gap-8 font-medium">
        {navLinks.map((nav, index) => (
          <NavLink
            key={index}
            to={nav.path}
            className={({ isActive }) =>
              `relative transition duration-300 ${
                isActive
                  ? "text-[#0E5A4F] border-b-2 border-[#0E5A4F] font-semibold"
                  : "text-gray-600 hover:text-[#0E5A4F]"
              }`
            }
          >
            {nav.title}
          </NavLink>
        ))}
      </ul>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {token && userData ? (
          <div
            className="flex items-center gap-2 cursor-pointer relative"
            onClick={() => setOpenDropdown(!openDropdown)}
            ref={dropdownRef}
          >
            <img
              className="w-9 h-9 rounded-full border-2 border-[#D4A24C] object-cover"
              src={userData.image || assets.upload_area}
              alt=""
            />

            <img className="w-3" src={assets.dropdown_icon} alt="" />

            {/* Dropdown */}
            <div
              className={`${
                openDropdown ? "block" : "hidden"
              } absolute top-12 right-0 bg-white shadow-lg rounded-xl p-4 w-44 text-sm`}
            >
              <p
                onClick={() => navigate("/profile")}
                className="py-2 px-2 rounded hover:bg-[#F5F1E8] cursor-pointer"
              >
                My Profile
              </p>
              <p
                onClick={() => navigate("/my-appointments")}
                className="py-2 px-2 rounded hover:bg-[#F5F1E8] cursor-pointer"
              >
                My Appointments
              </p>
              <p
                onClick={logoutFunc}
                className="py-2 px-2 rounded hover:bg-red-50 text-red-500 cursor-pointer"
              >
                Logout
              </p>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-[#0E5A4F] text-white px-6 py-2 rounded-full shadow-md hover:opacity-90 transition hidden md:block"
          >
            Login
          </button>
        )}

        {/* Mobile Menu Icon */}
        <img
          onClick={() => setShowMenu(true)}
          className="w-6 cursor-pointer md:hidden"
          src={assets.menu_icon}
          alt=""
        />

        {/* Mobile Menu */}
        <div
          className={`${showMenu ? "fixed w-full" : "h-0 w-0"} 
          md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-[#F5F1E8] transition-all duration-300`}
        >
          <div className="flex items-center justify-between px-5 py-6">
            <Link onClick={() => setShowMenu(false)} to="/">
              <img className="w-36" src={assets.logo} />
            </Link>
            <img
              className="w-7 cursor-pointer"
              onClick={() => setShowMenu(false)}
              src={assets.cross_icon}
              alt=""
            />
          </div>

          <ul className="flex flex-col items-center gap-4 mt-5 px-5 text-lg font-medium">
            {navLinks.map((nav, index) => (
              <NavLink
                onClick={() => setShowMenu(false)}
                key={index}
                to={nav.path}
                className={({ isActive }) =>
                  `transition duration-300 ${
                    isActive
                      ? "text-[#0E5A4F] font-bold border-b-2 border-[#0E5A4F] pb-1"
                      : "text-gray-600 hover:text-[#0E5A4F]"
                  }`
                }
              >
                {nav.title}
              </NavLink>
            ))}

            {!token && (
              <button
                onClick={() => {
                  setShowMenu(false);
                  navigate("/login");
                }}
                className="mt-4 bg-[#0E5A4F] text-white px-6 py-2 rounded-full"
              >
                Login
              </button>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
