import { assets } from "../assets/assets";

const About = () => {
  return (
    <div className="bg-[#FDFBF7] min-h-screen py-10">
      {/* Header Section */}
      <div className="text-center py-6">
        <h1 className="text-3xl md:text-4xl font-bold text-[#1A2B4C] mb-2">
          About <span className="text-[#0E5A4F]">MEDPRO</span>
        </h1>
        <p className="text-[#475467] text-sm max-w-xl mx-auto">
          Revolutionizing how patients connect with healthcare{" "}
          <span className="text-[#0E5A4F] font-semibold">professionals</span>
        </p>
      </div>

      {/* Mission Section */}
      <div className="my-8 flex flex-col md:flex-row gap-8 items-center">
        <img
          className="w-full md:max-w-[350px] rounded-2xl shadow-lg"
          src={assets.about_image}
          alt="About MEDPRO"
        />
        <div className="flex flex-col justify-center gap-6 md:w-1/2">
          <div>
            <h2 className="text-2xl font-bold text-[#1A2B4C] mb-3">
              Our <span className="text-[#0E5A4F]">Mission</span>
            </h2>
            <p className="text-[#475467] text-sm leading-7">
              At MEDPRO, we believe that{" "}
              <span className="text-[#0E5A4F] font-semibold">
                quality healthcare
              </span>{" "}
              should be{" "}
              <span className="text-[#0E5A4F] font-semibold">
                accessible to everyone
              </span>
              . We've built a platform that eliminates the complexity of finding
              and booking appointments with qualified doctors, putting your
              health in your hands.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#1A2B4C] mb-2">
              What We <span className="text-[#0E5A4F]">Offer</span>
            </h3>
            <p className="text-[#475467] text-sm leading-7">
              From{" "}
              <span className="text-[#0E5A4F] font-semibold">
                instant appointment booking
              </span>{" "}
              to{" "}
              <span className="text-[#0E5A4F] font-semibold">
                verified doctor profiles
              </span>
              , we provide everything needed for a smooth healthcare experience.
              Our technology-driven approach saves you time and connects you
              with the right medical professionals instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="bg-white rounded-2xl shadow-md p-8 my-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1A2B4C]">
            Why Choose <span className="text-[#0E5A4F]">MEDPRO</span>
          </h2>
          <p className="text-[#475467] text-sm mt-2">
            Experience healthcare reimagined for the modern patient
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="group rounded-2xl bg-[#FDFBF7] border-2 border-[#E9E9E9] p-6 hover:border-[#0E5A4F] hover:shadow-lg transition-all duration-300">
            <div className="text-3xl font-bold text-[#0E5A4F] mb-2">⚡</div>
            <h3 className="text-lg font-bold text-[#1A2B4C] mb-2">
              Lightning <span className="text-[#0E5A4F]">Fast</span>
            </h3>
            <p className="text-[#475467] text-sm leading-6">
              Book appointments in{" "}
              <span className="text-[#0E5A4F] font-semibold">seconds</span>, not
              hours. Our streamlined system gets you to the doctor without
              unnecessary delays.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group rounded-2xl bg-[#FDFBF7] border-2 border-[#E9E9E9] p-6 hover:border-[#0E5A4F] hover:shadow-lg transition-all duration-300">
            <div className="text-3xl font-bold text-[#0E5A4F] mb-2">🔒</div>
            <h3 className="text-lg font-bold text-[#1A2B4C] mb-2">
              Completely <span className="text-[#0E5A4F]">Safe</span>
            </h3>
            <p className="text-[#475467] text-sm leading-6">
              Your health data is{" "}
              <span className="text-[#0E5A4F] font-semibold">protected</span>{" "}
              with industry-leading security standards. Trust us with your
              information.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group rounded-2xl bg-[#FDFBF7] border-2 border-[#E9E9E9] p-6 hover:border-[#0E5A4F] hover:shadow-lg transition-all duration-300">
            <div className="text-3xl font-bold text-[#0E5A4F] mb-2">👥</div>
            <h3 className="text-lg font-bold text-[#1A2B4C] mb-2">
              Verified <span className="text-[#0E5A4F]">Doctors</span>
            </h3>
            <p className="text-[#475467] text-sm leading-6">
              Every doctor on our platform is{" "}
              <span className="text-[#0E5A4F] font-semibold">
                verified and qualified
              </span>
              . Your care is in trusted hands.
            </p>
          </div>
        </div>
      </div>

      {/* Vision Section */}
      <div className="bg-gradient-to-r from-[#0E5A4F] to-[#0c4a3f] rounded-2xl p-8 text-white text-center my-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">
          Our <span className="text-[#C19A6B]">Vision</span>
        </h2>
        <p className="text-sm leading-7 max-w-2xl mx-auto">
          We envision a world where{" "}
          <span className="text-[#C19A6B] font-semibold">
            quality healthcare is just a click away
          </span>
          . By bridging the gap between patients and medical professionals,
          we're building a healthier future for everyone.
        </p>
      </div>
    </div>
  );
};

export default About;
