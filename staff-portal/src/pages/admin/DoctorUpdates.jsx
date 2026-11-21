import { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";

const DoctorUpdates = () => {
  const { aToken, getDoctorUpdates, approveUpdate, rejectUpdate } = useContext(AdminContext);
  const [requests, setRequests] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  const fetchRequests = async () => {
    const data = await getDoctorUpdates();
    if (data) {
      setRequests(data);
    }
  };

  useEffect(() => {
    if (aToken) {
      fetchRequests();
    }
  }, [aToken]);

  const handleApprove = async (id) => {
    if (processingId) return;
    setProcessingId(id);
    const success = await approveUpdate(id);
    if (success) {
      await fetchRequests();
    }
    setProcessingId(null);
  };

  const handleReject = async (id) => {
    if (processingId) return;
    setProcessingId(id);
    const success = await rejectUpdate(id);
    if (success) {
      await fetchRequests();
    }
    setProcessingId(null);
  };

  // Helper function to format keys nicely
  const formatKey = (key) => {
    return key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
  };

  // Safely parse JSON strings or reconstruct malformed objects
  const getParsedValue = (value) => {
    if (value === null || value === undefined) return value;
    
    // Attempt to fix broken stringified objects stored natively
    if (typeof value === "object" && !Array.isArray(value)) {
      const keys = Object.keys(value);
      
      if (keys.includes("0") && typeof value["0"] === "string") {
        const numericKeys = keys.filter(k => !isNaN(Number(k))).sort((a, b) => Number(a) - Number(b));
        const reconstructed = numericKeys.map((k) => value[k]).join("");
        
        try {
          const parsed = JSON.parse(reconstructed);
          if (typeof parsed === "object" && parsed !== null) return parsed;
        } catch {
          return reconstructed;
        }
      }
    }

    // Try parsing if it's a stringified JSON
    if (typeof value === "string" && value.startsWith("{")) {
      try {
        return JSON.parse(value);
      } catch {
        // parsing failed, returning string
      }
    }

    return value;
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 md:p-10 bg-[#FDFBF7] min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-[#1A2B4C]">
          Profile <span className="text-[#0E5A4F]">Update Requests</span>
        </h1>
        <p className="text-[#475467] text-sm mt-2">Approve or reject doctor profile changes</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {requests.length === 0 ? (
          <div className="bg-white border border-[#E9E9E9] rounded-2xl p-10 text-center">
            <p className="text-[#475467] text-lg font-medium">No pending requests right now.</p>
          </div>
        ) : (
          requests.map((request, index) => (
            <div key={index} className="bg-white border-2 border-[#E9E9E9] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center">
              {/* Doctor Info */}
              <div className="flex items-center gap-4 min-w-[250px] border-b md:border-b-0 md:border-r border-[#E9E9E9] pb-4 md:pb-0 md:pr-6 w-full md:w-auto">
                <img
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#E9E9E9]"
                  src={request.docId.image}
                  alt={request.docId.name}
                />
                <div>
                  <p className="font-bold text-lg text-[#1A2B4C]">{request.docId.name}</p>
                  <p className="text-sm text-[#475467]">{request.docId.speciality} • {request.docId.degree}</p>
                  <p className="text-xs text-[#0E5A4F] mt-1 font-semibold bg-[#0E5A4F]/10 px-2 py-0.5 w-fit rounded-full">
                    {new Date(request.date).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Requested Changes */}
              <div className="flex-1 w-full">
                {request.reason && (
                  <div className="mb-4 bg-[#FFF8E1] border-l-4 border-yellow-400 p-3 rounded-r-lg">
                    <p className="text-[10px] font-bold text-[#1A2B4C] uppercase tracking-wider mb-1">Doctor's Note:</p>
                    <p className="text-sm text-[#475467] italic">"{request.reason}"</p>
                  </div>
                )}
                <p className="text-sm font-semibold text-[#475467] mb-3">Requested Changes:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(request.updateData).map(([key, value]) => {
                    const parsedValue = getParsedValue(value);

                    return (
                      <div key={key} className="bg-[#F5F1E8] p-3 rounded-lg border border-[#E9E9E9]">
                        <p className="text-xs font-bold text-[#1A2B4C] mb-1">{formatKey(key)}</p>
                        {typeof parsedValue === "object" && parsedValue !== null && !Array.isArray(parsedValue) ? (
                          <div className="space-y-1">
                            {Object.entries(parsedValue).map(([subKey, subValue]) => (
                              <p key={subKey} className="text-sm text-[#475467] truncate" title={subValue}>
                                <span className="font-semibold text-[#1A2B4C]">{formatKey(subKey)}:</span> {String(subValue)}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-[#475467] truncate" title={String(parsedValue)}>{String(parsedValue)}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-row md:flex-col gap-3 w-full md:w-40 border-t md:border-t-0 border-[#E9E9E9] pt-4 md:pt-0">
                <button
                  onClick={() => handleApprove(request._id)}
                  disabled={processingId === request._id}
                  className={`flex-1 font-bold py-2.5 px-4 rounded-lg transition-all ${
                    processingId === request._id
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                  }`}
                >
                  {processingId === request._id ? "Processing..." : "Approve"}
                </button>
                <button
                  onClick={() => handleReject(request._id)}
                  disabled={processingId === request._id}
                  className={`flex-1 font-bold py-2.5 px-4 rounded-lg transition-all ${
                    processingId === request._id
                      ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                      : "bg-red-100 hover:bg-red-200 text-red-600 cursor-pointer"
                  }`}
                >
                  {processingId === request._id ? "Processing..." : "Reject"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DoctorUpdates;
