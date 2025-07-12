import DomainActivity from "../models/domainActivity.model.js";

// POST: /api/domain
export const trackDomainActivity = async (req, res) => {
    try {
        const { domain, startTime, endTime, user } = req.body;

        if (!domain || !startTime || !endTime) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newActivity = new DomainActivity({
            domain,
            startTime,
            endTime,
            user,
        });

        await newActivity.save();

        res.status(201).json({
            message: "Activity saved successfully",
            data: newActivity,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET: /api/domain
export const getAllActivities = async (req, res) => {
    try {
        const activities = await DomainActivity.find().sort({ startTime: -1 });
        res.json(activities);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
