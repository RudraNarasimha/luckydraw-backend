import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import participantsRouter from "./routes/Participants.js";
import winnersRouter from "./routes/Winners.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/participants", participantsRouter);
app.use("/winners", winnersRouter);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));
