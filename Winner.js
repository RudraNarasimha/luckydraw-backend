import mongoose from "mongoose";

const rankEnum = [
  "1st Prize",
  "2nd Prize",
  "3rd Prize",
  "Consolation Prize",
  "Special Prize"
];

const WinnerSchema = new mongoose.Schema(
  {
    participant: { type: mongoose.Schema.Types.ObjectId, ref: "Participant", required: true },
    rank: { type: String, enum: rankEnum, required: true },
    year: { type: String, required: true, trim: true },
    assignedAt: { type: Date, required: true }
  },
  { timestamps: true }
);

// A participant can win only once per year
WinnerSchema.index({ participant: 1, year: 1 }, { unique: true });

// Only one of each 1st/2nd/3rd per year
WinnerSchema.index(
  { rank: 1, year: 1 },
  {
    unique: true,
    partialFilterExpression: { rank: { $in: ["1st Prize", "2nd Prize", "3rd Prize"] } }
  }
);

export default mongoose.model("Winner", WinnerSchema);
