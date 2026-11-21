import mongoose from "mongoose";

const doctorUpdateSchema = new mongoose.Schema(
  {
    docId: { type: mongoose.Schema.Types.ObjectId, ref: "doctor", required: true },
    updateData: { type: Object, required: true },
    reason: { type: String },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    date: { type: Number, required: true },
  },
  { minimize: false }
);

const doctorUpdateModel =
  mongoose.models.doctorUpdate || mongoose.model("doctorUpdate", doctorUpdateSchema);

export default doctorUpdateModel;
