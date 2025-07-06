import express from "express";
import Activity from "../models/activity.model.js";
import { logActivity, getActivitySummary, getLiveActivity } from "../controllers/activity.controller.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/log", verifyToken, logActivity);
router.post("/", verifyToken, logActivity);
router.get("/summary", verifyToken, getActivitySummary);

// 🔴 Live activity endpoint
router.get("/active", verifyToken, getLiveActivity);

router.post("/end-all", verifyToken, async (req, res) => {
  try {
    const result = await Activity.updateMany({ userId: req.user.id, isActive: true }, {
      isActive: false, endTime: new Date(), action: "close"
    });
    res.json({ success: true, message: `Ended ${result.modifiedCount} active sessions` });
  } catch (err) {
    console.error("Error ending sessions:", err);
    res.status(500).json({ success: false, message: "Failed to end active sessions" });
  }
});

// GET /api/activity - testing route (optional but useful)
router.get("/", (req, res) => {
  res.status(200).json({ message: "Activity route works!" });
});

// GET /api/activity/test-summary - get activity summary without auth (development only)
router.get("/test-summary", async (req, res) => {
  try {
    if (process.env.NODE_ENV === "production") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Test endpoints not allowed in production"
        });
    }

    // Use the default test user
    const defaultUser = await User.findOne({ email: "test@example.com" });
    if (!defaultUser) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No test user found. Run /seed first."
        });
    }

    // Get activities for test user
    const activities = await Activity.find({ userId: defaultUser._id }).sort({
      startTime: -1
    });

    // Group by category
    const categoryMap = new Map();

    activities.forEach(activity => {
      const category = categorizeDomain(activity.domain);

      if (categoryMap.has(category)) {
        categoryMap.set(
          category,
          categoryMap.get(category) + activity.duration
        );
      } else {
        categoryMap.set(category, activity.duration);
      }
    });

    // Transform to array format
    const categoryData = Array.from(
      categoryMap.entries()
    ).map(([category, totalDuration]) => ({
      category,
      minutes: Math.round(totalDuration / (1000 * 60)),
      color: getCategoryColor(category)
    }));

    res.json({
      success: true,
      data: categoryData
    });
  } catch (error) {
    console.error("Error getting test summary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get activity summary",
      error: error.message
    });
  }
});

// GET /api/activity/test-daily-usage - get daily usage without auth (development only)
router.get("/test-daily-usage", async (req, res) => {
  try {
    if (process.env.NODE_ENV === "production") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Test endpoints not allowed in production"
        });
    }

    const defaultUser = await User.findOne({ email: "test@example.com" });
    if (!defaultUser) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No test user found. Run /seed first."
        });
    }

    const activities = await Activity.find({ userId: defaultUser._id }).sort({
      startTime: 1
    });

    // Group by hour for today
    const hourlyUsage = new Map();

    activities.forEach(activity => {
      const hour = new Date(activity.startTime).getHours();
      const existing = hourlyUsage.get(hour) || 0;
      hourlyUsage.set(hour, existing + activity.duration);
    });

    // Fill in missing hours with 0 and convert to chart format
    const dailyData = [];
    for (let hour = 0; hour < 24; hour++) {
      dailyData.push({
        time: `${hour.toString().padStart(2, "0")}:00`,
        usage: Math.round((hourlyUsage.get(hour) || 0) / (1000 * 60)) // Convert to minutes
      });
    }

    res.json({
      success: true,
      data: dailyData
    });
  } catch (error) {
    console.error("Error getting test daily usage:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get daily usage",
      error: error.message
    });
  }
});

// GET /api/activity/test-top-sites - get top sites without auth (development only)
router.get("/test-top-sites", async (req, res) => {
  try {
    if (process.env.NODE_ENV === "production") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Test endpoints not allowed in production"
        });
    }

    const defaultUser = await User.findOne({ email: "test@example.com" });
    if (!defaultUser) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No test user found. Run /seed first."
        });
    }

    const activities = await Activity.find({ userId: defaultUser._id }).sort({
      startTime: -1
    });

    // Group by domain
    const domainMap = new Map();
    let totalDuration = 0;

    activities.forEach(activity => {
      const domain = activity.domain;
      const existing = domainMap.get(domain) || 0;
      domainMap.set(domain, existing + activity.duration);
      totalDuration += activity.duration;
    });

    // Sort by duration and get top sites
    const topSites = Array.from(domainMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([domain, duration]) => ({
        domain,
        duration: formatDuration(duration),
        percentage: Math.round(duration / totalDuration * 100)
      }));

    res.json({
      success: true,
      data: topSites
    });
  } catch (error) {
    console.error("Error getting test top sites:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get top sites",
      error: error.message
    });
  }
});

// Helper function to get category colors
function getCategoryColor(category) {
  const colors = {
    Social: "#3B82F6", // blue
    Development: "#10B981", // green
    Entertainment: "#F59E0B", // amber
    Productivity: "#8B5CF6", // purple
    News: "#EF4444", // red
    Shopping: "#EC4899", // pink
    Education: "#06B6D4", // cyan
    Other: "#6B7280" // gray
  };
  return colors[category] || colors["Other"];
}

// Helper function to format duration
function formatDuration(ms) {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export default router;

