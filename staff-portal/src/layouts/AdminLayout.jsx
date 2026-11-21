import { Routes, Route } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Dashboard from "../pages/admin/Dashboard";
import AllAppointments from "../pages/admin/AllAppointments";
import AddDoctor from "../pages/admin/AddDoctor";
import DoctorsList from "../pages/admin/DoctorsList";
import DoctorUpdates from "../pages/admin/DoctorUpdates";
import NotAuthorized from "../pages/auth/NotAuthorized";

const AdminLayout = () => (
  <div className="bg-[#FDFBF7] min-h-screen flex flex-col">
    <Navbar />
    <div className="flex items-start flex-1">
      <Sidebar/>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="all-appointments" element={<AllAppointments />} />
        <Route path="add-doctor" element={<AddDoctor />} />
        <Route path="doctors-list" element={<DoctorsList />} />
        <Route path="doctor-updates" element={<DoctorUpdates />} />
        
        <Route path="*" element={<NotAuthorized />} />
      </Routes>
    </div>
  </div>
);

export default AdminLayout;
