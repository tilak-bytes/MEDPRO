import { useContext, useState } from "react";
import { assets } from "../../assets/assets";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import axios from "axios";

const AddDoctor = () => {
  const [docImg, setDocImg] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [experience, setExperience] = useState("");
  const [fees, setFees] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [degree, setDegree] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [about, setAbout] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { backendUrl, aToken, getAllDoctors } = useContext(AdminContext);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (!docImg) {
        return toast.error("Please upload a doctor image.");
      }
      const formData = new FormData();
      formData.append("image", docImg);
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("password", password);
      formData.append("experience", experience);
      formData.append("fees", Number(fees));
      formData.append("about", about);
      formData.append("speciality", speciality);
      formData.append("degree", degree);
      formData.append(
        "address",
        JSON.stringify({ line1: address1, line2: address2 })
      );

      const { data } = await axios.post(
        backendUrl + "/api/admin/add-doctor",
        formData,
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        setDocImg(false);
        setName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setExperience("");
        setFees("");
        setSpeciality("");
        setDegree("");
        setAddress1("");
        setAddress2("");
        setAbout("");
        await getAllDoctors();
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Something went wrong, please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="p-6 md:p-10 w-full bg-[#FDFBF7] min-h-screen">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1A2B4C]">
            Add New <span className="text-[#0E5A4F]">Doctor</span>
          </h1>
          <p className="text-[#475467] text-sm mt-2">Register a new healthcare professional</p>
        </div>
        <p className="text-sm text-[#475467] italic"><span className="text-red-500">*</span> Indicates required field</p>
      </div>

      <div className="bg-white px-4 md:px-6 lg:px-8 py-6 md:py-10 border-2 border-[#E9E9E9] rounded-2xl w-full max-w-5xl max-h-[85vh] overflow-y-scroll shadow-sm">
        {/* Image Upload */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 mb-8 md:mb-10 pb-6 md:pb-8 border-b border-[#E9E9E9]">
          <label htmlFor="doc-img" className="cursor-pointer flex-shrink-0">
            <img
              className="w-20 h-20 md:w-24 md:h-24 bg-[#F5F1E8] rounded-xl object-cover border-2 border-[#E9E9E9] hover:border-[#0E5A4F] transition-all"
              src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
              alt="Upload"
            />
          </label>
          <input
            onChange={(e) => setDocImg(e.target.files[0])}
            type="file"
            id="doc-img"
            hidden
          />
          <div>
            <p className="font-semibold text-[#1A2B4C] text-sm md:text-base">Upload <span className="text-[#0E5A4F]">Doctor Photo</span> <span className="text-red-500 cursor-help" title="Required field">*</span></p>
            <p className="text-[#475467] text-xs md:text-sm mt-1">JPG, PNG or GIF (Max 5MB)</p>
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8 mb-6 md:mb-8">
          {/* Left Column */}
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="flex-1 flex flex-col gap-2">
              <label className="font-semibold text-[#1A2B4C] text-sm">Doctor Name <span className="text-red-500 cursor-help" title="Required field">*</span></label>
              <input
                className="border-2 border-[#E9E9E9] rounded-lg px-4 py-2 md:py-3 focus:outline-none focus:border-[#0E5A4F] transition-all text-sm md:text-base"
                onChange={(e) => setName(e.target.value)}
                value={name}
                type="text"
                placeholder="Full name"
                required
              />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="font-semibold text-[#1A2B4C] text-sm">Email Address <span className="text-red-500 cursor-help" title="Required field">*</span></label>
              <input
                className="border-2 border-[#E9E9E9] rounded-lg px-4 py-2 md:py-3 focus:outline-none focus:border-[#0E5A4F] transition-all text-sm md:text-base"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="Email"
                required
              />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="font-semibold text-[#1A2B4C] text-sm">Mobile Number</label>
              <input
                className="border-2 border-[#E9E9E9] rounded-lg px-4 py-2 md:py-3 focus:outline-none focus:border-[#0E5A4F] transition-all text-sm md:text-base"
                onChange={(e) => setPhone(e.target.value)}
                value={phone}
                type="tel"
                placeholder="10-digit mobile number"
                maxLength={10}
              />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="font-semibold text-[#1A2B4C] text-sm">Password <span className="text-red-500 cursor-help" title="Required field">*</span></label>
              <input
                className="border-2 border-[#E9E9E9] rounded-lg px-4 py-2 md:py-3 focus:outline-none focus:border-[#0E5A4F] transition-all text-sm md:text-base"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type="password"
                placeholder="Password"
                required
              />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="font-semibold text-[#1A2B4C] text-sm">Experience <span className="text-red-500 cursor-help" title="Required field">*</span></label>
              <select
                className="border-2 border-[#E9E9E9] rounded-lg px-4 py-2 md:py-3 focus:outline-none focus:border-[#0E5A4F] transition-all text-[#475467] text-sm md:text-base"
                onChange={(e) => setExperience(e.target.value)}
                value={experience}
                required
              >
                <option value="">Select years of experience</option>
                <option value="1 year">1 year</option>
                <option value="2 years">2 years</option>
                <option value="3 years">3 years</option>
                <option value="4 years">4 years</option>
                <option value="5 years">5 years</option>
                <option value="6 years">6 years</option>
                <option value="7 years">7 years</option>
                <option value="8 years">8 years</option>
                <option value="9 years">9 years</option>
                <option value="10 years">10 years</option>
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="font-semibold text-[#1A2B4C] text-sm">Consultation Fee <span className="text-red-500 cursor-help" title="Required field">*</span></label>
              <input
                className="border-2 border-[#E9E9E9] rounded-lg px-4 py-2 md:py-3 focus:outline-none focus:border-[#0E5A4F] transition-all text-sm md:text-base"
                onChange={(e) => setFees(e.target.value)}
                value={fees}
                type="number"
                placeholder="Fee amount"
                required
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="flex-1 flex flex-col gap-2">
              <label className="font-semibold text-[#1A2B4C] text-sm">Speciality <span className="text-red-500 cursor-help" title="Required field">*</span></label>
              <select
                className="border-2 border-[#E9E9E9] rounded-lg px-4 py-2 md:py-3 focus:outline-none focus:border-[#0E5A4F] transition-all text-[#475467] text-sm md:text-base"
                onChange={(e) => setSpeciality(e.target.value)}
                value={speciality}
                required
              >
                <option value="">Select speciality</option>
                <option value="General physician">General physician</option>
                <option value="Gynecologist">Gynecologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Pediatricians">Pediatricians</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Gastroenterologist">Gastroenterologist</option>
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="font-semibold text-[#1A2B4C] text-sm">Education/Degree <span className="text-red-500 cursor-help" title="Required field">*</span></label>
              <input
                className="border-2 border-[#E9E9E9] rounded-lg px-4 py-2 md:py-3 focus:outline-none focus:border-[#0E5A4F] transition-all text-sm md:text-base"
                onChange={(e) => setDegree(e.target.value)}
                value={degree}
                type="text"
                placeholder="e.g., MBBS, MD"
                required
              />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="font-semibold text-[#1A2B4C] text-sm">Address Line 1 <span className="text-red-500 cursor-help" title="Required field">*</span></label>
              <input
                className="border-2 border-[#E9E9E9] rounded-lg px-4 py-2 md:py-3 focus:outline-none focus:border-[#0E5A4F] transition-all text-sm md:text-base"
                onChange={(e) => setAddress1(e.target.value)}
                value={address1}
                type="text"
                placeholder="Street address"
                required
              />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="font-semibold text-[#1A2B4C] text-sm">Address Line 2</label>
              <input
                className="border-2 border-[#E9E9E9] rounded-lg px-4 py-2 md:py-3 focus:outline-none focus:border-[#0E5A4F] transition-all text-sm md:text-base"
                onChange={(e) => setAddress2(e.target.value)}
                value={address2}
                type="text"
                placeholder="City, state, postal code"
              />
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="mb-6 md:mb-8 border-t border-[#E9E9E9] pt-6 md:pt-8">
          <label className="font-semibold text-[#1A2B4C] text-sm mb-2 md:mb-3 block">About <span className="text-[#0E5A4F]">Doctor</span> <span className="text-red-500 cursor-help" title="Required field">*</span></label>
          <textarea
            className="w-full border-2 border-[#E9E9E9] rounded-lg px-4 py-2 md:py-3 focus:outline-none focus:border-[#0E5A4F] transition-all resize-none text-sm md:text-base"
            onChange={(e) => setAbout(e.target.value)}
            value={about}
            placeholder="Write a brief description about the doctor, experience, achievements..."
            rows={5}
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 md:px-8 py-2.5 md:py-3 rounded-lg font-semibold transition-all w-full text-sm md:text-base ${
            isSubmitting
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#0E5A4F] hover:bg-[#0c4a3f] text-white cursor-pointer"
          }`}
        >
          {isSubmitting ? "Adding..." : "Add Doctor"}
        </button>
      </div>
    </form>
  );
};

export default AddDoctor;
