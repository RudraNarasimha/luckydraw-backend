import { Router } from "express";
import Participant from "./Participant.js";
import Winner from "./Winner.js";

const router = Router();

// GET all (with optional ?search=&year=)
router.get("/", async (req, res) => {
  try {
    const { search = "", year = "" } = req.query;
    const q = {};
    if (year) q.year = String(year);
    if (search) {
      q.$or = [
        { tokenNo: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } }
      ];
    }
    const items = await Participant.find(q).sort({ createdAt: -1 });
    res.json(items.map(mapParticipant));
  } catch (e) {
    res.status(500).json({ error: "Failed to load participants" });
  }
});

// GET one
router.get("/:id", async (req, res) => {
  try {
    const p = await Participant.findById(req.params.id);
    if (!p) return res.status(404).json({ error: "Not found" });
    res.json(mapParticipant(p));
  } catch {
    res.status(400).json({ error: "Invalid id" });
  }
});

// CREATE
router.post("/", async (req, res) => {
  try {
    const { tokenNo, name, phone, year } = req.body ?? {};
    if (!tokenNo || !name || !phone || !year) {
      return res.status(400).json({ error: "Missing fields" });
    }
    const created = await Participant.create({ tokenNo, name, phone, year });
    res.json(mapParticipant(created));
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({ error: "Duplicate token for this year" });
    }
    res.status(500).json({ error: "Failed to create participant" });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const { tokenNo, name, phone, year } = req.body ?? {};
    const updated = await Participant.findByIdAndUpdate(
      req.params.id,
      { tokenNo, name, phone, year },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(mapParticipant(updated));
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({ error: "Duplicate token for this year" });
    }
    res.status(500).json({ error: "Failed to update participant" });
  }
});

// DELETE (also cascade delete winners)
router.delete("/:id", async (req, res) => {
  try {
    const p = await Participant.findByIdAndDelete(req.params.id);
    if (!p) return res.status(404).json({ error: "Not found" });
    await Winner.deleteMany({ participant: p._id });
    res.json({ ok: true });
  } catch {
    res.status(400).json({ error: "Invalid id" });
  }
});

function mapParticipant(p) {
  return {
    id: String(p._id),
    tokenNo: p.tokenNo,
    name: p.name,
    phone: p.phone,
    year: p.year
  };
}

export default router;

