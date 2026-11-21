const ConfirmModal = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
}) => {
  const isCancel = title?.toLowerCase().includes("cancel");

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-[#1A2B4C] mb-4">{title}</h2>
        <p className="text-[#475467] mb-8 leading-7">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`text-white px-6 py-2.5 rounded-lg font-semibold transition-all ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : isCancel
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#0E5A4F] hover:bg-[#0c4a3f]"
            }`}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="bg-[#F5F1E8] text-[#475467] px-6 py-2.5 rounded-lg font-semibold hover:bg-[#E9E9E9] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
