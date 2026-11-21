import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import DoctorCard from "../components/DoctorCard";

const Doctors = () => {
  const { slug } = useParams();
  const { pathname } = useLocation();
  const [filterDoc, setFilterDoc] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();

  const { doctors, getDoctorsData } = useContext(AppContext);

  const specialityList = [
    { name: "General physician", slug: "general-physician" },
    { name: "Gynecologist", slug: "gynecologist" },
    { name: "Dermatologist", slug: "dermatologist" },
    { name: "Pediatricians", slug: "pediatricians" },
    { name: "Neurologist", slug: "neurologist" },
    { name: "Gastroenterologist", slug: "gastroenterologist" },
  ];

  const applyFilter = () => {
    if (slug) {
      setFilterDoc(
        doctors.filter(
          (doc) =>
            doc.speciality.toLowerCase().replace(/\s+/g, "-") ===
            slug.toLowerCase()
        )
      );
    } else {
      setFilterDoc(doctors);
    }
  };

  useEffect(() => {
    applyFilter();
  }, [doctors, slug]);

  useEffect(() => {
    getDoctorsData();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 10);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Header Section */}
      <div className="mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1A2B4C] mb-3">
          Find Your <span className="text-[#0E5A4F]">Doctor</span>
        </h1>
        <p className="text-[#475467] text-lg max-w-2xl">
          Select a <span className="font-semibold text-[#0E5A4F]">specialty</span> from our list to discover qualified healthcare professionals ready to help you.
        </p>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar - Filters */}
        <div className="lg:w-64 flex-shrink-0">
          {/* Mobile Filter Toggle */}
          <button
            className={`lg:hidden w-full mb-6 py-3 px-4 rounded-lg text-sm transition-all font-semibold ${
              showFilter
                ? "bg-[#0E5A4F] text-white shadow-md"
                : "border-2 border-[#0E5A4F] text-[#0E5A4F] hover:bg-[#0E5A4F] hover:text-white"
            }`}
            onClick={() => setShowFilter((prev) => !prev)}
          >
            {showFilter ? "✕ Hide Filters" : "☰ Show Filters"}
          </button>

          {/* Filter Panel */}
          <div
            className={`${
              showFilter ? "flex" : "hidden lg:flex"
            } flex-col gap-2 bg-white rounded-2xl shadow-sm border border-[#E9E9E9] p-6 sticky top-20`}
          >
            <h3 className="text-lg font-bold text-[#1A2B4C] mb-4">
              Specialities
            </h3>
            
            {specialityList.map((doc) => (
              <button
                key={doc.slug}
                onClick={() => {
                  slug === doc.slug
                    ? navigate("/doctors")
                    : navigate(`/doctors/${doc.slug}`);
                  setShowFilter(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 font-medium text-sm ${
                  slug === doc.slug
                    ? "bg-[#0E5A4F] text-white shadow-md border border-[#0E5A4F]"
                    : "text-[#475467] hover:bg-[#F5F1E8] border border-transparent hover:border-[#0E5A4F]"
                }`}
              >
                <span className="flex items-center justify-between">
                  {doc.name}
                  {slug === doc.slug && <span className="text-lg">✓</span>}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Content - Doctors Grid */}
        <div className="flex-1 lg:min-h-[60vh]">
          {/* Results Header */}
          <div className="mb-8">
            <p className="text-sm text-[#0E5A4F] font-semibold uppercase tracking-wide">
              {slug ? (
                <>
                  Showing <span className="text-[#C19A6B]">{filterDoc.length}</span> {slug.replace("-", " ")}s
                </>
              ) : (
                <>
                  Showing all <span className="text-[#C19A6B]">{filterDoc.length}</span> doctors
                </>
              )}
            </p>
          </div>

          {/* Doctor Cards Grid */}
          {filterDoc.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filterDoc.map((doctor, index) => (
                <DoctorCard key={index} doctor={doctor} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-96 bg-white rounded-2xl border border-[#E9E9E9]">
              <div className="text-center">
                <p className="text-[#475467] text-lg font-medium mb-2">No doctors found</p>
                <p className="text-[#999] text-sm">Try selecting a different specialty</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
