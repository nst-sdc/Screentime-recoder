import express from "express";
import Activity from "../models/activity.model.js";
import User from "../models/user.model.js";
import categorizeDomain from "../utils/category.util.js";
import {
  logActivity,
  getActivitySummary,
  getActivitySummaryByCategory
} from "../controllers/activity.controller.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// POST /api/activity/log - for extension tracking (what the extension expects)
router.post("/log", verifyToken, logActivity);

// POST /api/activity - for tracking app usage
router.post("/", verifyToken, logActivity);

// GET /api/activity/summary - get user's activity summary
router.get("/summary", verifyToken, getActivitySummary);

// ✅ New route: GET summary grouped by category
router.get("/summary/category", verifyToken, getActivitySummaryByCategory);

// GET /api/activity/active - get currently active sessions
router.get("/active", verifyToken, async (req, res) => {
  try {
    const activeSessions = await Activity.find({
      userId: req.user.id,
      isActive: true
    }).sort({ startTime: -1 });

    res.json({
      success: true,
      data: activeSessions,
      count: activeSessions.length
    });
  } catch (error) {
    console.error("Error getting active sessions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get active sessions"
    });
  }
});

// POST /api/activity/end-all - end all active sessions
router.post("/end-all", verifyToken, async (req, res) => {
  try {
    const result = await Activity.updateMany(
      { userId: req.user.id, isActive: true },
      {
        isActive: false,
        endTime: new Date(),
        action: "close"
      }
    );

    res.json({
      success: true,
      message: `Ended ${result.modifiedCount} active sessions`
    });
  } catch (error) {
    console.error("Error ending sessions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to end active sessions"
    });
  }
});

// POST /api/activity/track - for website tracking
router.post("/track", verifyToken, async (req, res) => {
  const { url, action, tabId } = req.body;

  const domain = new URL(url).hostname;
  const category = categorizeDomain(domain);

  const newActivity = new Activity({
    userId: req.user.id,
    url,
    action: action || "visit",
    tabId: tabId || 0,
    timestamp: new Date(),
    domain
  });

  try {
    await newActivity.save();
    res.status(201).json({ message: "Activity recorded", category, domain });
  } catch (err) {
    console.error("Error recording activity:", err);
    res.status(500).json({ error: "Failed to record activity" });
  }
});

// GET /api/activity - testing route (optional but useful)
router.get("/", (req, res) => {
  res.status(200).json({ message: "Activity route works!" });
});

export default router;
