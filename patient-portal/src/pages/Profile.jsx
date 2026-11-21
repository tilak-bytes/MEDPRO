import { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

const Profile = () => {
  const { userData, setUserData, backendUrl, token, loadUserProfileData } =
    useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(false);

  // Secure Identifier Update State
  const [identifierType, setIdentifierType] = useState(null); // 'email' | 'phone' | null
  const [newIdentifier, setNewIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleRequestIdentifierChange = async () => {
    try {
      setIsSubmitting(true);
      const { data } = await axios.post(
        backendUrl + "/api/user/update-identifier-request",
        { newIdentifier },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        setShowOtp(true);
        setTimer(90); // 90 seconds timer
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyIdentifierChange = async () => {
    try {
      setIsSubmitting(true);
      const { data } = await axios.post(
        backendUrl + "/api/user/update-identifier-verify",
        { newIdentifier, otp },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        setIdentifierType(null);
        setNewIdentifier("");
        setOtp("");
        setShowOtp(false);
        setTimer(0);
        await loadUserProfileData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateUserProfileData = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", userData.name);
      formData.append("address", JSON.stringify(userData.address));
      formData.append("gender", userData.gender || "");
      formData.append("dob", userData.dob);

      image && formData.append("image", image);

      const { data } = await axios.post(
        backendUrl + "/api/user/update-profile",
        formData,
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message || "Profile updated successfully");
        await loadUserProfileData();
        setIsEdit(false);
        setImage(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    userData && (
      <div className="max-w-2xl flex flex-col gap-6 text-sm py-10">
        
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-[#E9E9E9]">
          {isEdit ? (
            <label htmlFor="image">
              <div className="inline-block relative cursor-pointer">
                <img
                  className="w-32 h-32 rounded-lg object-cover border-2 border-[#0E5A4F] opacity-75"
                  src={image ? URL.createObjectURL(image) : userData.image}
                  alt="Profile"
                />
                <img
                  className="w-8 absolute bottom-2 right-2 bg-white p-1 rounded-full"
                  src={image ? "" : assets.upload_icon}
                  alt="Upload"
                />
              </div>
              <input
                onChange={(e) => setImage(e.target.files[0])}
                type="file"
                id="image"
                hidden
              />
            </label>
          ) : (
            <img className="w-32 h-32 rounded-lg object-cover border-2 border-[#E9E9E9]" src={userData.image} alt="Profile" />
          )}

          <div className="flex-1">
            {isEdit ? (
              <input
                className="bg-[#F5F1E8] text-3xl font-bold max-w-96 mt-2 p-3 rounded-lg border border-[#DDD] text-[#1A2B4C]"
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, name: e.target.value }))
                }
                value={userData.name}
                type="text"
              />
            ) : (
              <p className="text-3xl font-bold text-[#1A2B4C]">
                {userData.name}
              </p>
            )}
            <p className="text-[#475467] mt-1">User <span className="text-[#0E5A4F] font-semibold">Account</span></p>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <p className="text-[#0E5A4F] font-bold text-lg mb-4">Contact Information</p>
          <div className="grid grid-cols-[1fr_2fr] gap-y-4 gap-x-6 text-[#475467]">
            <p className="font-semibold text-[#1A2B4C]">Email:</p>
            <div className="flex items-center gap-4">
              <p className="text-[#0E5A4F] font-medium">{userData.email}</p>
              <button 
                onClick={() => setIdentifierType('email')}
                className="text-xs text-[#0E5A4F] underline hover:text-[#0c4a3f]"
              >
                Change
              </button>
            </div>
            
            <p className="font-semibold text-[#1A2B4C]">Phone:</p>
            <div className="flex items-center gap-4">
              <p className="text-[#475467] font-medium">{userData.phone || "Not provided"}</p>
              <button 
                onClick={() => setIdentifierType('phone')}
                className="text-xs text-[#0E5A4F] underline hover:text-[#0c4a3f]"
              >
                Change
              </button>
            </div>
            
            <p className="font-semibold text-[#1A2B4C]">Address:</p>
            {isEdit ? (
              <div className="space-y-2">
                <input
                  className="bg-[#F5F1E8] border border-[#DDD] p-2 rounded-lg w-full text-[#475467]"
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      address: { ...prev.address, line1: e.target.value },
                    }))
                  }
                  value={userData.address.line1}
                  type="text"
                  placeholder="Address Line 1"
                />
                <input
                  className="bg-[#F5F1E8] border border-[#DDD] p-2 rounded-lg w-full text-[#475467]"
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      address: { ...prev.address, line2: e.target.value },
                    }))
                  }
                  value={userData.address.line2}
                  type="text"
                  placeholder="Address Line 2"
                />
              </div>
            ) : (
              <p className="text-[#475467] font-medium">
                {userData.address.line1}
                <br />
                {userData.address.line2 || ""}
              </p>
            )}
          </div>
        </div>

        {/* Basic Information */}
        <div>
          <p className="text-[#0E5A4F] font-bold text-lg mb-4">Basic Information</p>
          <div className="grid grid-cols-[1fr_2fr] gap-y-4 gap-x-6 text-[#475467]">
            <p className="font-semibold text-[#1A2B4C]">Gender:</p>
            {isEdit ? (
              <select
                className="bg-[#F5F1E8] border border-[#DDD] p-2 rounded-lg text-[#475467]"
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, gender: e.target.value }))
                }
                value={userData.gender || ""}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Others">Others</option>
              </select>
            ) : (
              <p className="text-[#475467] font-medium">{userData.gender || "Not specified"}</p>
            )}
            
            <p className="font-semibold text-[#1A2B4C]">Date of Birth:</p>
            {isEdit ? (
              <input
                className="bg-[#F5F1E8] border border-[#DDD] p-2 rounded-lg text-[#475467]"
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, dob: e.target.value }))
                }
                value={userData.dob}
                type="date"
              />
            ) : (
              <p className="text-[#475467] font-medium">{userData.dob || "Not provided"}</p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6">
          {isEdit ? (
            <button
              className={`text-white px-8 py-3 rounded-lg font-semibold transition-all mr-3 ${
                isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#0E5A4F] hover:bg-[#0c4a3f]"
              }`}
              onClick={updateUserProfileData}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          ) : (
            <button
              className="border-2 border-[#0E5A4F] text-[#0E5A4F] px-8 py-3 rounded-lg font-semibold hover:bg-[#0E5A4F] hover:text-white transition-all"
              onClick={() => setIsEdit(true)}
            >
              Edit Profile
            </button>
          )}
          {isEdit && (
            <button
              className="border border-[#DDD] text-[#475467] px-8 py-3 rounded-lg font-semibold hover:bg-[#F5F1E8] transition-all"
              onClick={() => setIsEdit(false)}
            >
              Cancel
            </button>
          )}
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

export default Profile;
