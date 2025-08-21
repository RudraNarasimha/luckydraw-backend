import { Router } from "express";
import Winner from "./Winner.js";
import Participant from "./Participant.js";

const router = Router();

// GET all (optional ?year=)
router.get("/", async (req, res) => {
  try {
    const { year = "" } = req.query;
    const q = {};
    if (year) q.year = String(year);

    const winners = await Winner.find(q).populate("participant").sort({ assignedAt: -1 });
    res.json(winners.map(mapWinner));
  } catch {
    res.status(500).json({ error: "Failed to load winners" });
  }
});

// CREATE winner
// Accepts either:
// 1) { participantId, rank, year, assignedAt? }
// 2) { participant: { id, ... }, rank, year, assignedAt? }  <-- matches your frontend Winner shape
router.post("/", async (req, res) => {
  try {
    const body = req.body ?? {};
    const participantId = body.participantId || body.participant?.id;

    const { rank, year } = body;
    const assignedAt = body.assignedAt ? new Date(body.assignedAt) : new Date();

    if (!participantId || !rank || !year) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const participant = await Participant.findById(participantId);
    if (!participant) return res.status(404).json({ error: "Participant not found" });

    const created = await Winner.create({
      participant: participant._id,
      rank,
      year,
      assignedAt
    });

    const populated = await created.populate("participant");
    res.json(mapWinner(populated));
  } catch (e) {
    if (e.code === 11000) {
      // Violates unique indices (participant per year OR only one 1st/2nd/3rd per year)
      return res.status(409).json({ error: "Winner constraint violated (duplicate for year/rank)" });
    }
    res.status(500).json({ error: "Failed to create winner" });
  }
});

// DELETE winner
router.delete("/:id", async (req, res) => {
  try {
    const w = await Winner.findByIdAndDelete(req.params.id);
    if (!w) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch {
    res.status(400).json({ error: "Invalid id" });
  }
});

function mapWinner(w) {
  return {
    id: String(w._id),
    rank: w.rank,
    year: w.year,
    assignedAt: new Date(w.assignedAt).toISOString(),
    participant: {
      id: String(w.participant._id),
      tokenNo: w.participant.tokenNo,
      name: w.participant.name,
      phone: w.participant.phone,
      year: w.participant.year
    }
  };
}

export default router;

