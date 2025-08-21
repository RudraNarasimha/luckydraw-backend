import mongoose from "mongoose";

const ParticipantSchema = new mongoose.Schema(
  {
    tokenNo: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    year: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

// Avoid duplicate token number in the same year
ParticipantSchema.index({ tokenNo: 1, year: 1 }, { unique: true });

export default mongoose.model("Participant", ParticipantSchema);
