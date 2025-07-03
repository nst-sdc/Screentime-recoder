import mongoose from "mongoose";

const timeSchema = new mongoose.Schema({
    domain: String,
    startTime: Date,
    endTime: Date,
    duration: Number,
});

const TimeLog = mongoose.model("TimeLog", timeSchema);

export const trackTime = async (req, res) => {
    try {
        const { domain, startTime, endTime } = req.body;

        if (!domain || !startTime || !endTime) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const duration = new Date(endTime) - new Date(startTime);

        const log = new TimeLog({ domain, startTime, endTime, duration });
        await log.save();

        res.status(201).json({ message: "Time tracked successfully", log });
    } catch (err) {
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

export const getAllTimeLogs = async (req, res) => {
    try {
        const logs = await TimeLog.find().sort({ startTime: -1 });
        res.status(200).json(logs);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch time logs", error: err.message });
    }
};