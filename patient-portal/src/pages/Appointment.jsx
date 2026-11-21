import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import RelatedDoctors from "../components/RelatedDoctors";
import { toast } from "react-toastify";
import axios from "axios";

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } =
    useContext(AppContext);
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const navigate = useNavigate();

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  const fetchDoc = () => {
    const docInfo = doctors.find((doc) => doc._id === docId);
    setDocInfo(docInfo);
  };

  const getAvailableSlots = async () => {
    setDocSlots([]);
    let today = new Date();

    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      let slotDateObj = new Date(currentDate);
      slotDateObj.setHours(10, 0, 0, 0); // Start of slots
      let endTime = new Date(currentDate);
      endTime.setHours(20, 30, 0, 0); // End of slots at 8:30pm

      // If it's today, start after current time rounded up to next slot
      if (i === 0) {
        const now = new Date();
        const bookingStartTime = new Date(currentDate);
        bookingStartTime.setHours(10, 0, 0, 0); // 10:00 AM

        const nextSlot = new Date(now);
        nextSlot.setMinutes(now.getMinutes() > 30 ? 0 : 30);
        nextSlot.setHours(
          now.getMinutes() > 30 ? now.getHours() + 1 : now.getHours()
        );
        nextSlot.setSeconds(0, 0);

        // Use the later of now-rounded-up or 4 PM
        const startFrom =
          nextSlot > bookingStartTime ? nextSlot : bookingStartTime;

        if (startFrom > endTime) continue; // skip today if no valid slot left
        slotDateObj = new Date(startFrom); // start from next available slot
      }

      let timeSlots = [];

      while (slotDateObj <= endTime) {
        let formattedTime = slotDateObj.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        let slotDay = slotDateObj.getDate();
        let slotMonth = slotDateObj.getMonth() + 1;
        let slotYear = slotDateObj.getFullYear();
        const slotDateKey = slotDay + "_" + slotMonth + "_" + slotYear;

        const isSlotBooked =
          docInfo?.slots_booked?.[slotDateKey]?.includes(formattedTime);

        if (!isSlotBooked) {
          timeSlots.push({
            datetime: new Date(slotDateObj),
            time: formattedTime,
          });
        }

        slotDateObj.setMinutes(slotDateObj.getMinutes() + 30);
      }

      if (timeSlots.length > 0) {
        setDocSlots((prev) => [...prev, timeSlots]);
      }
    }
  };

  const bookAppointment = async () => {
    if (!token) {
      toast.warn("Please login to book an appointment");
      return navigate("/login");
    }
    if (isBooking) return;

    setIsBooking(true);
    try {
      const date = docSlots[slotIndex][0].datetime;
      let day = date.getDate();
      let month = date.getMonth() + 1; // Months are zero-based
      let year = date.getFullYear();

      const slotDate = day + "_" + month + "_" + year;

      const { data } = await axios.post(
        backendUrl + "/api/user/book-appointment",
        { docId, slotDate, slotTime },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message || "Appointment booked successfully");
        getDoctorsData(); // Refresh doctors data
        navigate("/my-appointments");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to book appointment"
      );
    } finally {
      setIsBooking(false);
    }
  };

  useEffect(() => {
    fetchDoc();
  }, [doctors, docId]);

  useEffect(() => {
    getAvailableSlots();
  }, [docInfo]);

  // Refresh slots when window regains focus (e.g., after switching tabs)
  useEffect(() => {
    const handleFocus = () => {
      getDoctorsData();
      if (docInfo) getAvailableSlots();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [docInfo]);

  useEffect(() => {
    if (docInfo && !docInfo.available) {
      toast.info(
        `${docInfo.name} is currently unavailable. You may book an appointment with one of our other top-rated doctors.`,{
          autoClose: 10000,
          draggable: true
        }
      );
    }
  }, [docInfo]);

  return (
    docInfo && (
      <div>
        <div className="flex flex-col sm:flex-row gap-6">
          <div className={docInfo.available ? "" : "opacity-50"}>
            <img
              className="bg-[#E6F0ED] w-full sm:max-w-80 rounded-lg"
              src={docInfo.image}
              alt={docInfo.name}
            />
          </div>

          {/* ---------- Doctor Details ---------- */}
          <div className="flex-1 border border-[#E9E9E9] rounded-lg p-8 bg-white">
            <p className="flex items-center gap-2 text-2xl font-bold text-[#1A2B4C]">
              {docInfo.name}
              <img className="w-5" src={assets.verified_icon} alt="verified" />
            </p>
            <div className="flex items-center gap-3 text-sm mt-2 text-[#475467]">
              <p className="font-medium">
                {docInfo.degree} - {docInfo.speciality}
              </p>
              <button className="py-1 px-3 border border-[#DDD] text-xs rounded-full font-medium text-[#0E5A4F]">
                {docInfo.experience}
              </button>
            </div>
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-[#1A2B4C] mt-4">
                About <img src={assets.info_icon} alt="info" />
              </p>
              <p className="text-sm text-[#475467] max-w-[700px] mt-2 leading-7">
                {docInfo.about}
              </p>
            </div>
            <p className="text-[#475467] font-medium mt-6">
              Appointment fee:{" "}
              <span className="text-[#1A2B4C] font-bold">
                {currencySymbol}
                {docInfo.fees}
              </span>
            </p>
          </div>
        </div>

        {/* ---------- Booking slots ---------- */}
        {docInfo.available ? (
          <div className="sm:ml-72 sm:pl-6 mt-8 font-medium text-[#1A2B4C]">
            <p className="text-lg font-bold">Select <span className="text-[#0E5A4F]">Appointment</span> Slot</p>
            <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4 pb-2">
              {docSlots.length &&
                docSlots.map((item, index) => (
                  <div
                    onClick={() => setSlotIndex(index)}
                    className={`text-center py-4 px-3 min-w-20 rounded-lg cursor-pointer font-medium transition-all ${
                      slotIndex === index
                        ? "bg-[#0E5A4F] text-white border border-[#0E5A4F]"
                        : "border border-[#DDD] text-[#475467] hover:border-[#0E5A4F]"
                    }`}
                    key={index}
                  >
                    <p className="text-xs">{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                    <p className="text-sm">{item[0] && item[0].datetime.getDate()}</p>
                  </div>
                ))}
            </div>

            <div className="flex items-center gap-3 w-full overflow-x-scroll mt-4 pb-2">
              {docSlots.length &&
                docSlots[slotIndex].map((item, index) => (
                  <p
                    onClick={() => setSlotTime(item.time)}
                    className={`text-sm font-medium flex-shrink-0 px-5 py-2 rounded-lg cursor-pointer transition-all ${
                      item.time === slotTime
                        ? "bg-[#0E5A4F] text-white border border-[#0E5A4F]"
                        : "text-[#475467] border border-[#DDD] hover:border-[#0E5A4F]"
                    }`}
                    key={index}
                  >
                    {item.time.toLowerCase()}
                  </p>
                ))}
            </div>
            <button
              onClick={bookAppointment}
              disabled={isBooking}
              className={`text-white text-sm font-semibold px-12 py-3 rounded-lg my-6 transition-all ${
                isBooking 
                  ? "bg-[#0E5A4F]/60 cursor-not-allowed" 
                  : "bg-[#0E5A4F] cursor-pointer hover:bg-[#0c4a3f]"
              }`}
            >
              {isBooking ? "Booking..." : "Book Appointment"}
            </button>
          </div>
        ) : (
          <div className="mt-10 flex items-center justify-center gap-3 text-center p-6 bg-[#F5F1E8] rounded-lg">
            <p className="w-3 h-3 rounded-full bg-[#0E5A4F]"></p>
            <p className="text-[#475467] font-medium">
              {docInfo.name} is currently unavailable. You may book an
              appointment with one of our other top-rated doctors.
            </p>
          </div>
        )}

        {/* Related Doctors section */}
        <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
      </div>
    )
  );
};

export default Appointment;
