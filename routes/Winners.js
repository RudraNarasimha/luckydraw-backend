import { Router } from "express";
import Winner from "../models/Winner.js";
import Participant from "../models/Participant.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { year = "" } = req.query;
    const q = {};
    if (year) q.year = String(year);
    const winners = await Winner.find(q).populate("participant").sort({ createdAt: -1 });
    res.json(winners.map(mapWinner));
  } catch {
    res.status(500).json({ error: "Failed to load winners" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { participantId, prize, year } = req.body ?? {};
    if (!participantId || !prize || !year) return res.status(400).json({ error: "Missing fields" });
    const participant = await Participant.findById(participantId);
    if (!participant) return res.status(404).json({ error: "Participant not found" });

    const created = await Winner.create({ participant: participantId, prize, year });
    res.json(mapWinner(await created.populate("participant")));
  } catch {
    res.status(500).json({ error: "Failed to create winner" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Winner.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch {
    res.status(400).json({ error: "Invalid id" });
  }
});

function mapWinner(w) {
  return {
    id: String(w._id),
    prize: w.prize,
    year: w.year,
    participant: w.participant
      ? {
          id: String(w.participant._id),
          tokenNo: w.participant.tokenNo,
          name: w.participant.name,
          phone: w.participant.phone,
          year: w.participant.year,
        }
      : null,
  };
}

export default router;
