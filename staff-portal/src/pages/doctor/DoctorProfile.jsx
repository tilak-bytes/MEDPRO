import { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../../assets/assets";

const DoctorProfile = () => {
  const { dToken, profileData, setProfileData, getProfileData, getDashData } =
    useContext(DoctorContext);
  const { currencySymbol, backendUrl } = useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [reason, setReason] = useState("");

  // Secure Identifier Update State
  const [identifierType, setIdentifierType] = useState(null); // 'email' | 'phone' | null
  const [newIdentifier, setNewIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (timer > 0 && showOtp) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer, showOtp]);

  useEffect(() => {
    if (dToken) {
      getProfileData();
    }
  }, [dToken]);

  const handleEditClick = () => {
    setOriginalData(JSON.parse(JSON.stringify(profileData)));
    setIsEdit(true);
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setImageFile(null);
    setIsEdit(false);
  };

  const updateDoctorProfile = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const formData = new FormData();
      
      let hasChanges = false;

      // Append only changed fields
      if (profileData.name !== originalData.name) { formData.append("name", profileData.name); hasChanges = true; }
      if (profileData.email !== originalData.email) { formData.append("email", profileData.email); hasChanges = true; }
      if (profileData.phone !== originalData.phone) { formData.append("phone", profileData.phone); hasChanges = true; }
      if (profileData.speciality !== originalData.speciality) { formData.append("speciality", profileData.speciality); hasChanges = true; }
      if (profileData.degree !== originalData.degree) { formData.append("degree", profileData.degree); hasChanges = true; }
      if (profileData.experience !== originalData.experience) { formData.append("experience", profileData.experience); hasChanges = true; }
      if (profileData.about !== originalData.about) { formData.append("about", profileData.about); hasChanges = true; }
      if (profileData.fees !== originalData.fees) { formData.append("fees", profileData.fees); hasChanges = true; }
      if (JSON.stringify(profileData.address) !== JSON.stringify(originalData.address)) { 
        formData.append("address_line1", profileData.address.line1 || ""); 
        formData.append("address_line2", profileData.address.line2 || ""); 
        hasChanges = true; 
      }

      // Add reason if provided
      if (reason) {
        formData.append("reason", reason);
      }
      
      if (!hasChanges) {
        toast.info("No changes made.");
        setIsEdit(false);
        setIsUpdating(false);
        return;
      }

      const { data } = await axios.post(
        backendUrl + "/api/doctor/update-profile",
        formData,
        { headers: { dToken } }
      );

      if (data.success) {
        toast.success(data.message);
        setIsEdit(false);
        setImageFile(null);
        setReason(""); // Reset reason after submission
        await getProfileData();
        await getDashData();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update profile"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvailabilityChange = async () => {
    if (isChanging) return;
    setIsChanging(true);
    try {
      // Optimistically update UI
      setProfileData((prev) => ({ ...prev, available: !prev.available }));
      
      const { data } = await axios.post(
        backendUrl + "/api/doctor/update-profile",
        { available: !profileData.available },
        { headers: { dToken } }
      );
      
      if (data.success) {
        toast.success(data.message);
        await getDashData();
      }
    } catch (error) {
      // Revert if failed
      setProfileData((prev) => ({ ...prev, available: !prev.available }));
      toast.error(error.response?.data?.message || "Failed to update availability");
    } finally {
      setIsChanging(false);
    }
  };

  // --- SECURE OTP VERIFICATION WORKFLOW ---

  // 1. Sends an OTP to the newly requested Email or Phone
  const handleRequestIdentifierChange = async () => {
    try {
      setIsSubmitting(true);
      const { data } = await axios.post(
        backendUrl + "/api/doctor/update-identifier-request",
        { newIdentifier, docId: profileData._id },
        { headers: { dToken } }
      );
      if (data.success) {
        toast.success(data.message);
        setShowOtp(true);
        setTimer(90); // Start 90 seconds countdown
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Verifies the OTP and securely places the new data into the form state
  const handleVerifyIdentifierChange = async () => {
    try {
      setIsSubmitting(true);
      const { data } = await axios.post(
        backendUrl + "/api/doctor/update-identifier-verify",
        { newIdentifier, otp },
        { headers: { dToken } }
      );
      if (data.success) {
        toast.success("Verified successfully! Click 'Save Information' to submit your changes.");
        
        // Update the form state with the newly verified identifier
        if (identifierType === 'email') {
          setProfileData(prev => ({ ...prev, email: newIdentifier }));
        } else {
          setProfileData(prev => ({ ...prev, phone: newIdentifier }));
        }

        // Close the modal and reset states
        setIdentifierType(null);
        setNewIdentifier("");
        setOtp("");
        setShowOtp(false);
        setTimer(0);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------------------------

  return (
    profileData && (
      <div className="p-6 md:p-10 bg-[#FDFBF7] min-h-screen">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1A2B4C]">
              My <span className="text-[#0E5A4F]">Profile</span>
            </h1>
            <p className="text-[#475467] text-sm mt-2">Manage your professional information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (Image & Availability) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="relative group rounded-2xl overflow-hidden">
              <label htmlFor="imageUpload" className={isEdit ? "cursor-pointer" : ""}>
                <img
                  className="w-full bg-[#F5F1E8] rounded-2xl object-cover border-2 border-[#E9E9E9] shadow-md"
                  src={imageFile ? URL.createObjectURL(imageFile) : profileData.image}
                  alt={profileData.name}
                />
                {isEdit && (
                  <div className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <img className="w-10" src={assets.upload_icon} alt="upload" />
                    <p className="text-white text-sm font-semibold mt-2">Change Image</p>
                  </div>
                )}
              </label>
              <input
                type="file"
                id="imageUpload"
                hidden
                disabled={!isEdit}
                onChange={(e) => setImageFile(e.target.files[0])}
              />
            </div>
            
            {/* Availability Toggle */}
            <div className="mt-6 bg-white border-2 border-[#E9E9E9] rounded-2xl p-5 shadow-sm transition-all hover:shadow-md hover:border-[#0E5A4F]">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="available" className={`font-bold text-lg ${isChanging ? 'text-gray-400 cursor-not-allowed' : 'text-[#1A2B4C] cursor-pointer'}`}>
                    {isChanging ? "Updating..." : "Available for Appointments"}
                  </label>
                  <p className="text-xs text-[#475467] mt-1">Updates instantly. Toggle off if you are unavailable.</p>
                </div>
                <input
                  onChange={handleAvailabilityChange}
                  checked={profileData.available}
                  disabled={isChanging}
                  className={`w-6 h-6 accent-[#0E5A4F] ${isChanging ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  type="checkbox"
                  id="available"
                />
              </div>
            </div>
          </div>

          {/* Doctor Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border-2 border-[#E9E9E9] rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-[#E9E9E9] pb-6">
                <div>
                  <p className="text-xs font-semibold text-[#475467] uppercase tracking-wider mb-1">Name</p>
                  {isEdit ? (
                    <input className="w-full border-2 border-[#E9E9E9] rounded-lg px-3 py-2 text-[#1A2B4C] font-semibold" type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} />
                  ) : (
                    <p className="text-xl font-bold text-[#1A2B4C]">{profileData.name}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#475467] uppercase tracking-wider mb-1">Speciality</p>
                  {isEdit ? (
                    <select className="w-full border-2 border-[#E9E9E9] rounded-lg px-3 py-2 text-[#1A2B4C] font-semibold focus:outline-none focus:border-[#0E5A4F]" value={profileData.speciality} onChange={(e) => setProfileData({...profileData, speciality: e.target.value})}>
                      <option value="General physician">General physician</option>
                      <option value="Gynecologist">Gynecologist</option>
                      <option value="Dermatologist">Dermatologist</option>
                      <option value="Pediatricians">Pediatricians</option>
                      <option value="Neurologist">Neurologist</option>
                      <option value="Gastroenterologist">Gastroenterologist</option>
                    </select>
                  ) : (
                    <p className="text-[#0E5A4F] font-semibold">{profileData.speciality}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#475467] uppercase tracking-wider mb-1">Email</p>
                  {isEdit ? (
                    <div className="flex items-center justify-between bg-[#F5F1E8] border-2 border-[#E9E9E9] rounded-lg px-3 py-2">
                      <p className="text-[#1A2B4C] font-medium truncate">{profileData.email}</p>
                      <button 
                        onClick={() => setIdentifierType('email')}
                        className="text-xs font-semibold text-[#0E5A4F] hover:text-[#0c4a3f] underline shrink-0 ml-2"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <p className="text-[#1A2B4C] font-medium">{profileData.email}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#475467] uppercase tracking-wider mb-1">Phone</p>
                  {isEdit ? (
                    <div className="flex items-center justify-between bg-[#F5F1E8] border-2 border-[#E9E9E9] rounded-lg px-3 py-2">
                      <p className="text-[#1A2B4C] font-medium truncate">{profileData.phone || "Not provided"}</p>
                      <button 
                        onClick={() => setIdentifierType('phone')}
                        className="text-xs font-semibold text-[#0E5A4F] hover:text-[#0c4a3f] underline shrink-0 ml-2"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <p className="text-[#1A2B4C] font-medium">{profileData.phone}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#475467] uppercase tracking-wider mb-1">Degree</p>
                  {isEdit ? (
                    <input className="w-full border-2 border-[#E9E9E9] rounded-lg px-3 py-2 text-[#1A2B4C]" type="text" value={profileData.degree} onChange={(e) => setProfileData({...profileData, degree: e.target.value})} />
                  ) : (
                    <p className="text-[#1A2B4C] font-medium">{profileData.degree}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#475467] uppercase tracking-wider mb-1">Experience</p>
                  {isEdit ? (
                    <select className="w-full border-2 border-[#E9E9E9] rounded-lg px-3 py-2 text-[#1A2B4C] font-semibold focus:outline-none focus:border-[#0E5A4F]" value={profileData.experience} onChange={(e) => setProfileData({...profileData, experience: e.target.value})}>
                      <option value="1 year">1 year</option>
                      <option value="2 years">2 years</option>
                      <option value="3 years">3 years</option>
                      <option value="4 years">4 years</option>
                      <option value="5 years">5 years</option>
                      <option value="6 years">6 years</option>
                      <option value="7 years">7 years</option>
                      <option value="8 years">8 years</option>
                      <option value="9 years">9 years</option>
                      <option value="10+ years">10+ years</option>
                    </select>
                  ) : (
                    <p className="text-[#1A2B4C] font-medium">{profileData.experience}</p>
                  )}
                </div>
              </div>

              {/* About Section */}
              <div className="pt-2">
                <p className="text-xs font-semibold text-[#475467] uppercase tracking-wider mb-2">About</p>
                {isEdit ? (
                  <textarea className="w-full border-2 border-[#E9E9E9] rounded-lg px-3 py-2 text-[#1A2B4C] min-h-[100px]" value={profileData.about} onChange={(e) => setProfileData({...profileData, about: e.target.value})} />
                ) : (
                  <p className="text-sm md:text-base text-[#475467] leading-relaxed">
                    {profileData.about}
                  </p>
                )}
              </div>
            </div>

            {/* Fees and Address */}
            <div className="bg-white border-2 border-[#E9E9E9] rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
              <div>
                <p className="text-xs font-semibold text-[#475467] uppercase tracking-wider mb-3">Appointment Fee</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg md:text-2xl font-bold text-[#0E5A4F]">{currencySymbol}</span>
                  {isEdit ? (
                    <input
                      className="flex-1 border-2 border-[#E9E9E9] rounded-lg px-4 py-2 focus:outline-none focus:border-[#0E5A4F] transition-all max-w-[200px]"
                      type="number"
                      onChange={(e) => setProfileData((prev) => ({...prev, fees: e.target.value}))}
                      value={profileData.fees}
                    />
                  ) : (
                    <span className="text-lg md:text-2xl font-bold text-[#1A2B4C]">{profileData.fees}</span>
                  )}
                </div>
              </div>

              {/* Address */}
              <div>
                <p className="text-xs font-semibold text-[#475467] uppercase tracking-wider mb-3">Clinic Address</p>
                <div className="space-y-2">
                  {isEdit ? (
                    <>
                      <input
                        className="w-full border-2 border-[#E9E9E9] rounded-lg px-4 py-2 focus:outline-none focus:border-[#0E5A4F]"
                        type="text"
                        placeholder="Address Line 1"
                        onChange={(e) => setProfileData((prev) => ({...prev, address: { ...prev.address, line1: e.target.value }}))}
                        value={profileData.address.line1}
                      />
                      <input
                        className="w-full border-2 border-[#E9E9E9] rounded-lg px-4 py-2 focus:outline-none focus:border-[#0E5A4F]"
                        type="text"
                        placeholder="Address Line 2"
                        onChange={(e) => setProfileData((prev) => ({...prev, address: { ...prev.address, line2: e.target.value }}))}
                        value={profileData.address.line2}
                      />
                    </>
                  ) : (
                    <>
                      <p className="text-[#1A2B4C] font-medium">{profileData.address.line1}</p>
                      <p className="text-[#1A2B4C] font-medium">{profileData.address.line2}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Reason for Update (Only in Edit Mode) */}
              {isEdit && (
                <div className="bg-[#FFF8E1] border-l-4 border-yellow-400 p-4 rounded-r-lg">
                  <p className="text-xs font-bold text-[#1A2B4C] uppercase tracking-wider mb-2">Reason for Requesting Update (Optional)</p>
                  <textarea
                    rows={2}
                    className="w-full bg-white border border-[#E9E9E9] rounded-lg px-3 py-2 text-sm text-[#475467] focus:outline-none focus:ring-1 focus:ring-[#0E5A4F] resize-none"
                    placeholder="e.g., Updating contact info, new degree acquired, etc."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                  <p className="text-[10px] text-[#475467] mt-1 italic">This note will be visible to the administrator during review.</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-6 border-t border-[#E9E9E9]">
                {isEdit ? (
                  <div className="flex gap-4">
                    <button onClick={handleCancel} className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 md:py-3 rounded-lg transition-all">
                      Cancel
                    </button>
                    <button 
                      onClick={updateDoctorProfile} 
                      disabled={isUpdating}
                      className={`w-2/3 text-white font-semibold py-2.5 md:py-3 rounded-lg transition-all ${
                        isUpdating 
                          ? "bg-gray-400 cursor-not-allowed" 
                          : "bg-[#0E5A4F] hover:bg-[#0c4a3f] cursor-pointer"
                      }`}
                    >
                      {isUpdating ? "Applying..." : "Apply for Approval"}
                    </button>
                  </div>
                ) : (
                  <button onClick={handleEditClick} className="w-full bg-[#0E5A4F] hover:bg-[#0c4a3f] text-white font-semibold py-2.5 md:py-3 rounded-lg transition-all">
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Secure OTP Modal for Email/Phone Change */}
        {identifierType && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
              <button 
                onClick={() => {
                  setIdentifierType(null);
                  setShowOtp(false);
                  setNewIdentifier("");
                  setOtp("");
                  setTimer(0);
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl font-bold"
              >
                ✕
              </button>
              <h3 className="text-2xl font-bold text-[#1A2B4C] mb-2">Change {identifierType === 'email' ? 'Email' : 'Phone'}</h3>
              
              {!showOtp ? (
                <>
                  <p className="text-[#475467] text-sm mb-6">
                    Enter your new {identifierType === 'email' ? 'email address' : '10-digit mobile number'}. We will send a verification code to confirm it.
                  </p>
                  <input
                    type={identifierType === 'email' ? 'email' : 'tel'}
                    placeholder={`New ${identifierType === 'email' ? 'Email Address' : 'Mobile Number'}`}
                    value={newIdentifier}
                    onChange={(e) => setNewIdentifier(e.target.value)}
                    className="w-full border border-[#DDD] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#0E5A4F] mb-4 bg-[#F5F1E8]"
                  />
                  <button
                    onClick={handleRequestIdentifierChange}
                    disabled={isSubmitting || !newIdentifier}
                    className="w-full bg-[#0E5A4F] text-white py-3 rounded-lg font-semibold hover:bg-[#0c4a3f] transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? "Sending..." : "Send OTP"}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-[#475467] text-sm mb-6">
                    Enter the 6-digit OTP sent to <span className="font-bold text-[#0E5A4F]">{newIdentifier}</span>.
                  </p>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="w-full border border-[#DDD] rounded-lg p-3 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-[#0E5A4F] mb-4 bg-[#F5F1E8] font-bold text-[#1A2B4C]"
                  />
                  <button
                    onClick={handleVerifyIdentifierChange}
                    disabled={isSubmitting || otp.length !== 6 || timer === 0}
                    className="w-full bg-[#0E5A4F] text-white py-3 rounded-lg font-semibold hover:bg-[#0c4a3f] transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? "Verifying..." : "Verify & Save"}
                  </button>
                  
                  <div className="flex flex-col items-center mt-4 text-sm text-[#475467] gap-2">
                    {timer > 0 ? (
                      <p>Time remaining: <span className="font-semibold text-[#0E5A4F]">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span></p>
                    ) : (
                      <p className="text-red-500 font-medium">OTP Expired</p>
                    )}
                    
                    {timer === 0 ? (
                      <button
                        onClick={handleRequestIdentifierChange}
                        disabled={isSubmitting}
                        className="text-[#0E5A4F] font-semibold hover:underline"
                      >
                        Resend OTP
                      </button>
                    ) : null}
                    
                    <button
                      onClick={() => {
                        setShowOtp(false);
                        setTimer(0);
                      }}
                      className="hover:underline mt-2"
                    >
                      Use a different {identifierType}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    )
  );
};

export default DoctorProfile;
