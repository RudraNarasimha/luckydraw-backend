import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    tokenNo: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    year: { type: String, required: true },
  },
  { timestamps: true }
);

participantSchema.index({ tokenNo: 1, year: 1 }, { unique: true });

export default mongoose.model("Participant", participantSchema);
