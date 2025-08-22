import mongoose from "mongoose";

const winnerSchema = new mongoose.Schema(
  {
    participant: { type: mongoose.Schema.Types.ObjectId, ref: "Participant", required: true },
    prize: { type: String, required: true },
    year: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Winner", winnerSchema);
