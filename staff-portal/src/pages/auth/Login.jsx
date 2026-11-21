import { useState, useEffect, useRef } from "react";

import { useContext } from "react";
import { AdminContext } from "../../context/AdminContext";
import axios from "axios";
import { toast } from "react-toastify";
import { DoctorContext } from "../../context/DoctorContext";

const Login = () => {
  const [state, setState] = useState("Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // forgot password states
  const [forgotState, setForgotState] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // OTP countdown timer
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  // Start / restart the countdown
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimer(90);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setOtp(""); // clear OTP on expiry
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Format seconds → m:ss
  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const { setAToken, backendUrl } = useContext(AdminContext);
  const { setDToken } = useContext(DoctorContext);

  // ── login ────────────────────────────────────────────────────
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      if (state === "Admin") {
        const { data } = await axios.post(backendUrl + "/api/admin/login", {
          email,
          password,
        });
        if (data.success) {
          localStorage.setItem("aToken", data.token);
          setAToken(data.token);
          toast.success("Admin logged in successfully");
        }
      } else {
        const { data } = await axios.post(backendUrl + "/api/doctor/login", {
          email,
          password,
        });
        if (data.success) {
          localStorage.setItem("dToken", data.token);
          setDToken(data.token);
          toast.success("Doctor logged in successfully");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid credentials");
    }
  };

  // ── Step 1: send OTP ─────────────────────────────────────────
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/send-reset-otp",
        { email: forgotEmail },
      );
      if (data.success) {
        toast.success(data.message || "OTP sent successfully!");
        setForgotStep(2);
        startTimer();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    }
  };

  // ── Step 2: verify OTP → get resetToken ──────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/verify-reset-otp",
        { email: forgotEmail, otp },
      );
      if (data.success) {
        toast.success("OTP verified!");
        setResetToken(data.resetToken);
        setForgotStep(3);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    }
  };

  // ── Step 3: reset password using resetToken ───────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/reset-password",
        { resetToken, newPassword },
      );
      if (data.success) {
        toast.success("Password reset successfully! Please login.");
        setForgotState(false);
        setForgotStep(1);
        setForgotEmail("");
        setOtp("");
        setResetToken("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6">
      {/* ── Login form ── */}
      <form onSubmit={onSubmitHandler} className="w-full flex justify-center">
        <div className="flex flex-col gap-5 w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-[#E9E9E9]">
          {/* Header */}
          <div className="text-center mb-4">
            <p className="text-3xl font-bold text-[#1A2B4C]">
              <span className="text-[#0E5A4F]">{state}</span> Login
            </p>
            <p className="text-[#475467] text-sm mt-2">
              Access your secure portal
            </p>
          </div>

          {/* Email / Phone */}
          <div className="w-full">
            <label className="block text-[#1A2B4C] font-semibold text-sm mb-2">
              {state === "Doctor" ? "Email or Mobile Number" : "Email Address"}
            </label>
            <input
              className="border-2 border-[#E9E9E9] rounded-lg w-full p-3 mt-1 text-sm focus:outline-none focus:border-[#0E5A4F] transition-all"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type={state === "Doctor" ? "text" : "email"}
              placeholder={state === "Doctor" ? "Email or 10-digit mobile number" : "Enter your email"}
              required
            />
          </div>

          {/* Password */}
          <div className="w-full">
            <label className="block text-[#1A2B4C] font-semibold text-sm mb-2">
              Password
            </label>
            <input
              className="border-2 border-[#E9E9E9] rounded-lg w-full p-3 mt-1 text-sm focus:outline-none focus:border-[#0E5A4F] transition-all"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="Enter your password"
              required
            />
            {/* Forgot password — Doctor only */}
            {state === "Doctor" && (
              <div className="text-right mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setForgotState(true);
                    setForgotStep(1);
                  }}
                  className="text-sm text-[#0E5A4F] font-medium hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="bg-[#0E5A4F] hover:bg-[#0c4a3f] text-white w-full py-3 rounded-lg text-base font-semibold cursor-pointer transition-all mt-2"
          >
            Login
          </button>

          {/* Toggle Admin / Doctor */}
          <div className="text-center pt-4 border-t border-[#E9E9E9]">
            {state === "Admin" ? (
              <p className="text-sm text-[#475467]">
                Are you a Doctor?{" "}
                <span
                  className="text-[#0E5A4F] font-semibold underline cursor-pointer hover:text-[#0c4a3f]"
                  onClick={() => setState("Doctor")}
                >
                  Login here
                </span>
              </p>
            ) : (
              <p className="text-sm text-[#475467]">
                Are you an Admin?{" "}
                <span
                  className="text-[#0E5A4F] font-semibold underline cursor-pointer hover:text-[#0c4a3f]"
                  onClick={() => setState("Admin")}
                >
                  Login here
                </span>
              </p>
            )}
          </div>
        </div>
      </form>

      {/* ── Forgot Password Modal — outside the form ── */}
      {forgotState && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm mx-4">
            {/* Step 1 — Enter Email */}
            {forgotStep === 1 && (
              <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
                <div>
                  <p className="text-xl font-bold text-[#1A2B4C]">
                    Forgot Password
                  </p>
                  <p className="text-sm text-[#475467] mt-1">
                    Enter your registered email or mobile number to receive an OTP.
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#1A2B4C]">
                    Email or Mobile Number
                  </label>
                  <input
                    type="text"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Email or 10-digit mobile number"
                    className="border border-[#DDD] rounded-lg w-full p-3 mt-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5A4F]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#0E5A4F] text-white py-3 rounded-lg font-semibold text-sm hover:bg-[#0c4a3f] transition-all"
                >
                  Send OTP
                </button>
                <button
                  type="button"
                  onClick={() => setForgotState(false)}
                  className="text-sm text-[#475467] hover:underline text-center"
                >
                  Back to Login
                </button>
              </form>
            )}

            {/* Step 2 — Enter OTP */}
            {forgotStep === 2 && (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
                <div>
                  <p className="text-xl font-bold text-[#1A2B4C]">Enter OTP</p>
                  <p className="text-sm text-[#475467] mt-1">
                    A 6-digit OTP was sent to <strong>{forgotEmail}</strong>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#1A2B4C]">
                    OTP
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder={timer === 0 ? "OTP expired" : "Enter 6-digit OTP"}
                    disabled={timer === 0}
                    className={`border border-[#DDD] rounded-lg w-full p-3 mt-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5A4F] tracking-widest text-center text-lg font-bold ${timer === 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}`}
                  />
                </div>
                {timer === 0 && (
                  <p className="text-xs text-red-500 text-center -mt-2">
                    OTP has expired. Please click Resend OTP to get a new one.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={timer === 0}
                  className={`w-full py-3 rounded-lg font-semibold text-sm transition-all ${
                    timer === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-[#0E5A4F] text-white hover:bg-[#0c4a3f]"
                  }`}
                >
                  Verify OTP
                </button>
                <button
                  type="button"
                  disabled={timer > 0}
                  onClick={() => {
                    setOtp("");
                    handleSendOtp();
                  }}
                  className={`text-sm text-center ${
                    timer > 0
                      ? "text-[#999] cursor-not-allowed"
                      : "text-[#475467] hover:underline cursor-pointer"
                  }`}
                >
                  {timer > 0
                    ? `Resend OTP in ${formatTime(timer)}`
                    : "Resend OTP"}
                </button>
              </form>
            )}

            {/* Step 3 — New Password */}
            {forgotStep === 3 && (
              <form
                onSubmit={handleResetPassword}
                className="flex flex-col gap-5"
              >
                <div>
                  <p className="text-xl font-bold text-[#1A2B4C]">
                    Reset Password
                  </p>
                  <p className="text-sm text-[#475467] mt-1">
                    Enter your new password below.
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#1A2B4C]">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="border border-[#DDD] rounded-lg w-full p-3 mt-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5A4F]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#1A2B4C]">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="border border-[#DDD] rounded-lg w-full p-3 mt-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5A4F]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#0E5A4F] text-white py-3 rounded-lg font-semibold text-sm hover:bg-[#0c4a3f] transition-all"
                >
                  Reset Password
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
