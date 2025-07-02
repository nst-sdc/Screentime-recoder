import express from "express";
import DomainActivity from "../models/domainActivity.model.js";

const router = express.Router();

/**
 * POST /api/domain
 * Logs a domain activity entry
 */
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
        res.status(201).json({
            message: "Domain activity saved successfully",
            data: entry,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/domain
 * Fetch all domain activity logs (sorted by start time descending)
 */
router.get("/", async (req, res) => {
    try {
        const logs = await DomainActivity.find().sort({ startTime: -1 });
        res.status(200).json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
