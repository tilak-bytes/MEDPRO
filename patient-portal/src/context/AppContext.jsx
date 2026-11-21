import { createContext } from "react";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useEffect } from "react";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const currencySymbol = "₹";
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
  const [doctors, setDoctors] = useState([]);

  const [token, setToken] = useState(() => {
    const t = localStorage.getItem("token");
    return t && t !== "false" && t !== "undefined" && t !== "null" ? t : false;
  });
  const [userData, setUserData] = useState(false);

  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/list");
      if (data.success) {
        setDoctors(data.doctors);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch doctors");
    }
  };

  const loadUserProfileData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/get-profile", {
        headers: { token },
      });

      if (data.success) {
        setUserData(data.userData);
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 404 || error.response?.data?.message?.toLowerCase().includes("auth")) {
        setToken(false);
        localStorage.removeItem("token");
      } else {
        toast.error(
          error.response?.data?.message || "Failed to load user profile"
        );
      }
    }
  };

  useEffect(() => {
    getDoctorsData();
  }, []);

  // Refresh doctors data every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      getDoctorsData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (token) {
      loadUserProfileData();
    } else {
      setUserData(false);
    }
  }, [token]);

  const value = {
    doctors,
    currencySymbol,
    backendUrl,
    token,
    setToken,
    userData,
    setUserData,
    loadUserProfileData,
    getDoctorsData,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
