import express from "express";
import DomainActivity from "../models/domainActivity.model.js";

const router = express.Router();

// POST: Track domain activity
router.post("/", async (req, res) => {
    try {
        const { domain, startTime, endTime, user } = req.body;

        if (!domain || !startTime || !endTime) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const entry = new DomainActivity({
            domain,
            startTime,
            endTime,
            user,
        });

        await entry.save();
        res.status(201).json(entry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ GET: Fetch all domain activity
router.get("/", async (req, res) => {
    try {
        const logs = await DomainActivity.find().sort({ startTime: -1 }); // newest first
        res.status(200).json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
