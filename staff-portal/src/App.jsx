import { useContext, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import NotAuthorized from "./pages/auth/NotAuthorized";
import NotFound from "./pages/auth/NotFound";

import { AdminContext } from "./context/AdminContext";
import { DoctorContext } from "./context/DoctorContext";

import AdminLayout from "./layouts/AdminLayout";
import DoctorLayout from "./layouts/DoctorLayout";

const App = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);

  const isAdmin = !!aToken;
  const isDoctor = !!dToken;

  useEffect(() => {
    if (isAdmin) {
      document.title = "Admin Portal - MEDPRO";
    } else if (isDoctor) {
      document.title = "Doctor Portal - MEDPRO";
    } else {
      document.title = "Staff Login - MEDPRO";
    }
  }, [isAdmin, isDoctor]);

  return (
    <div className="bg-[#FDFBF7] min-h-screen">
      <Routes>
      <Route
        path="/"
        element={
          isAdmin ? (
            <Navigate to="/admin/dashboard" />
          ) : isDoctor ? (
            <Navigate to="/doctor/dashboard" />
          ) : (
            <Login />
          )
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          isAdmin ? (
            <AdminLayout />
          ) : isDoctor ? (
            <NotAuthorized />
          ) : (
            <Navigate to="/" />
          )
        }
      />

      {/* Doctor Routes */}
      <Route
        path="/doctor/*"
        element={
          isDoctor ? (
            <DoctorLayout />
          ) : isAdmin ? (
            <NotAuthorized />
          ) : (
            <Navigate to="/" />
          )
        }
      />

      {/* Catch-All */}
      <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;
