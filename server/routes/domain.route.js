import express from "express";
import Activity from "../models/activity.model.js";
import categorizeDomain from "../utils/category.util.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Domain tracker
router.post("/track", verifyToken, async (req, res) => {
  const { url, action = "visit", tabId = 0, duration } = req.body;

  if (!url || duration == null) {
    return res.status(400).json({ message: "url and duration are required" });
  }

  const domain = new URL(url).hostname;
  const category = categorizeDomain(domain);

  try {
    await new Activity({
      userId: req.user.id,
      url,
      domain,
      action,
      tabId,
      timestamp: new Date(),
      duration,
      isActive: action !== "end"
    }).save();

    res.status(201).json({ message: "Activity recorded", domain, category });
  } catch (err) {
    console.error("Error recording activity:", err);
    res.status(500).json({ message: "Failed to record activity" });
  }
});

export default router;
