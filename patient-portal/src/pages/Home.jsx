import { useContext } from "react";
import Banner from "../components/Banner";
import Hero from "../components/Hero";
import SpecialityMenu from "../components/SpecialityMenu";
import TopDoctors from "../components/TopDoctors";
import { AppContext } from "../context/AppContext";

const Home = () => {
  const { userData } = useContext(AppContext);

  return (
    <div className="bg-[#FDFBF7]">
      
      {/* Hero */}
      <div className="max-w-[1500px] mx-auto px-6 md:px-10 lg:px-16 pt-6">
        <Hero userName={userData?.name} />
      </div>

      {/* Speciality Section */}
      <div className="mt-24 bg-[#F5F1E8] py-16">
        <div className="max-w-[1500px] mx-auto px-6 md:px-10 lg:px-16">
          <SpecialityMenu />
        </div>
      </div>

      {/* Doctors Section */}
      <div className="mt-0 bg-[#FDFBF7] py-16">
        <div className="max-w-[1500px] mx-auto px-6 md:px-10 lg:px-16">
          <TopDoctors />
        </div>
      </div>

      {/* Banner */}
      <div className="mt-24 max-w-[1500px] mx-auto px-6 md:px-10 lg:px-16">
        <Banner />
      </div>

    </div>
  );
};

export default Home;
