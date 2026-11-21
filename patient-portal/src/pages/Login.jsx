import { useContext, useState, useEffect, useRef } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { backendUrl, setToken, token } = useContext(AppContext);
  const navigate = useNavigate();

  const [state, setState] = useState("log in");
  const [signupStep, setSignupStep] = useState(1);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // forgot password states
  const [forgotState, setForgotState] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");

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

  // ── login / signup step 1 ───────────────────────────────────────────
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (state === "Sign Up") {
        if (password !== confirmPassword) {
          return toast.error("Passwords do not match");
        }
        const { data } = await axios.post(backendUrl + "/api/user/send-signup-otp", {
          name,
          email: email || undefined,
          phone: phone || undefined,
          password,
          confirmPassword,
        });
        if (data.success) {
          toast.success("Verification code sent!");
          setSignupStep(2);
          startTimer();
        } else {
          toast.error(data.message || "Failed to send verification code");
        }
      } else {
        const { data } = await axios.post(backendUrl + "/api/user/login", {
          email,
          password,
        });
        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          toast.success("Logged in successfully!");
        } else {
          toast.error(data.message || "Failed to log in");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── signup step 2: verify and register ────────────────────────────────
  const handleSignupRegister = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { data } = await axios.post(backendUrl + "/api/user/register", {
        name,
        email: email || undefined,
        phone: phone || undefined,
        password,
        otp,
      });
      if (data.success) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        toast.success(data.message || "Account created successfully!");
        // reset form
        setSignupStep(1);
        setOtp("");
      } else {
        toast.error(data.message || "Failed to create account");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step 1: send OTP ─────────────────────────────────────────
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/send-reset-otp",
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
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step 2: verify OTP → get resetToken ──────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/verify-reset-otp",
        { email: forgotEmail, otp },
      );
      if (data.success) {
        toast.success("OTP verified!");
        setResetToken(data.resetToken); // save token in state
        setForgotStep(3);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step 3: reset password using resetToken ───────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/reset-password",
        { resetToken, newPassword },
      );
      if (data.success) {
        toast.success("Password reset successfully! Please login.");
        // reset all states
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
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (token && typeof token === "string" && token !== "false" && token !== "undefined" && token !== "null") {
      navigate("/");
    }
  }, [token, navigate]);

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-10">
      {/* ── Login / Signup form ── */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full flex flex-col items-center"
      >
        <div className="flex flex-col gap-6 w-full max-w-sm px-4 py-10 bg-white rounded-2xl shadow-lg border border-[#E9E9E9]">
          {/* Header */}
          <div>
            <p className="text-3xl font-bold text-[#1A2B4C]">
              {state === "Sign Up" ? "Create Account" : "Welcome Back"}
            </p>
            <p className="text-[#475467] mt-2 text-sm">
              {state === "Sign Up"
                ? "Sign up to book your appointment"
                : "Log in to your account"}
            </p>
          </div>

          {/* Name — signup only */}
          {state === "Sign Up" && signupStep === 1 && (
            <div className="w-full">
              <label className="text-sm font-medium text-[#1A2B4C]">
                Full Name
              </label>
              <input
                className="border border-[#DDD] rounded-lg w-full p-3 mt-2 focus:outline-none focus:ring-2 focus:ring-[#0E5A4F] focus:border-transparent text-sm"
                type="text"
                placeholder="Enter your name"
                onChange={(e) => setName(e.target.value)}
                value={name}
                required
              />
            </div>
          )}

          {/* Email / Phone — changes based on state */}
          {state === "Sign Up" && signupStep === 1 ? (
            <>
              <div className="w-full">
                <label className="text-sm font-medium text-[#1A2B4C]">
                  Email Address
                </label>
                <input
                  className="border border-[#DDD] rounded-lg w-full p-3 mt-2 focus:outline-none focus:ring-2 focus:ring-[#0E5A4F] focus:border-transparent text-sm"
                  type="email"
                  placeholder="you@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                />
              </div>
              <div className="w-full">
                <label className="text-sm font-medium text-[#1A2B4C]">
                  Mobile Number
                </label>
                <input
                  className="border border-[#DDD] rounded-lg w-full p-3 mt-2 focus:outline-none focus:ring-2 focus:ring-[#0E5A4F] focus:border-transparent text-sm"
                  type="tel"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  onChange={(e) => setPhone(e.target.value)}
                  value={phone}
                />
                <p className="text-xs text-[#475467] mt-1">At least one of email or mobile is required</p>
              </div>
            </>
          ) : state !== "Sign Up" ? (
            <div className="w-full">
              <label className="text-sm font-medium text-[#1A2B4C]">
                Email or Mobile Number
              </label>
              <input
                className="border border-[#DDD] rounded-lg w-full p-3 mt-2 focus:outline-none focus:ring-2 focus:ring-[#0E5A4F] focus:border-transparent text-sm"
                type="text"
                placeholder="Email or 10-digit mobile number"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
              />
            </div>
          ) : null}

          {/* Password */}
          {(signupStep === 1 || state !== "Sign Up") && (
            <div className="w-full">
              <label className="text-sm font-medium text-[#1A2B4C]">
                Password
              </label>
              <input
                className="border border-[#DDD] rounded-lg w-full p-3 mt-2 focus:outline-none focus:ring-2 focus:ring-[#0E5A4F] focus:border-transparent text-sm"
                type="password"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                required
              />
              {/* Forgot password link — login only */}
              {state === "log in" && (
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
          )}

          {/* Confirm Password — signup step 1 only */}
          {state === "Sign Up" && signupStep === 1 && (
            <div className="w-full">
              <label className="text-sm font-medium text-[#1A2B4C]">
                Confirm Password
              </label>
              <input
                className="border border-[#DDD] rounded-lg w-full p-3 mt-2 focus:outline-none focus:ring-2 focus:ring-[#0E5A4F] focus:border-transparent text-sm"
                type="password"
                placeholder="••••••••"
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
                required
              />
            </div>
          )}

          {/* OTP Verification — signup step 2 only */}
          {state === "Sign Up" && signupStep === 2 && (
            <div className="w-full flex flex-col items-center gap-4">
              <p className="text-sm text-center text-[#475467]">
                We sent a verification code to your email and/or mobile number.
              </p>
              <div className="w-full">
                <input
                  className="border-2 border-[#E9E9E9] rounded-lg w-full p-3 text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-[#0E5A4F] transition-all"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  type="text"
                  maxLength={6}
                  placeholder="------"
                  required
                />
              </div>
              <div className="text-sm font-medium text-[#0E5A4F]">
                {timer > 0 ? (
                  <span>Time remaining: {formatTime(timer)}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSubmitHandler({ preventDefault: () => {} })}
                    className="hover:underline text-[#0E5A4F]"
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type={state === "Sign Up" && signupStep === 2 ? "button" : "submit"}
            onClick={state === "Sign Up" && signupStep === 2 ? handleSignupRegister : undefined}
            className={`w-full text-white py-3 rounded-lg font-semibold text-sm transition-all duration-300 mt-2 ${
              (state === "Sign Up" && signupStep === 2 && timer === 0) || isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#0E5A4F] hover:bg-[#0c4a3f]"
            }`}
            disabled={(state === "Sign Up" && signupStep === 2 && timer === 0) || isSubmitting}
          >
            {isSubmitting ? "Processing..." : (state === "Sign Up"
              ? signupStep === 1
                ? "Send Verification Code"
                : "Verify & Create Account"
              : "Login")}
          </button>

          {/* Toggle */}
          <div className="text-center">
            <p className="text-[#475467] text-sm">
              {state === "Sign Up" ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setState("log in")}
                    className="text-[#0E5A4F] font-semibold hover:underline"
                  >
                    Login
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setState("Sign Up")}
                    className="text-[#0E5A4F] font-semibold hover:underline"
                  >
                    Sign up
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </form>

      {/* Admin Portal Link */}
      <p className="mt-8 text-[#475467] text-center text-sm">
        Are you a Doctor or Admin?{" "}
        <a
          href="/admin"
          className="text-[#0E5A4F] font-semibold hover:underline"
        >
          Access admin portal
        </a>
      </p>

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
