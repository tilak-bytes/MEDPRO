import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Doctors from "./pages/Doctors";
import Login from "./pages/Login";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import Appointments from "./pages/Appointments";
import Appointment from "./pages/Appointment";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NotFound from "./pages/NotFound";

const App = () => {
  return (
    <div className="bg-[#FDFBF7] min-h-screen font-sans selection:bg-[#C19A6B]/30 selection:text-[#1A2B4C]">
      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        theme="light"
      />

      {/* Navbar */}
      <Navbar />

      <ScrollToTop />

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 md:px-10 pb-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctors/:slug" element={<Doctors />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-appointments" element={<Appointments />} />
          <Route path="/appointment/:docId" element={<Appointment />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
