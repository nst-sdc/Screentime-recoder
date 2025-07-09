import Activity from "../models/activity.model.js";
import { extractDomain } from "../utils/extractDomain.js";

export const logActivity = async (req, res) => {
  try {
    const {
      tabId,
      url,
      sessionId,
      action,
      title,
      duration,
      endTime
    } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const domain = extractDomain(url);

    if (!domain) {
      return res.status(400).json({ success: false, message: "Invalid URL" });
    }

    // Handle different types of activity logging
    switch (action) {
      case "start":
        // Start a new activity session
        await startActivitySession(
          req.user.id,
          tabId,
          url,
          domain,
          title,
          sessionId
        );
        break;

      case "update":
        // Update existing session with duration
        await updateActivitySession(sessionId, duration);
        break;

      case "end":
        // End activity session
        await endActivitySession(sessionId, endTime, duration);
        break;

      default:
        // Legacy support - create a complete activity record
        await createActivity(req.user.id, tabId, url, domain, title, duration);
    }

    res.status(201).json({
      success: true,
      message: "Activity logged successfully"
    });
  } catch (error) {
    console.error("Activity logging failed:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Start a new activity session
async function startActivitySession(
  userId,
  tabId,
  url,
  domain,
  title,
  sessionId
) {
  const newActivity = new Activity({
    userId,
    url,
    tabId,
    sessionId: sessionId || `${userId}_${tabId}_${Date.now()}`,
    startTime: new Date(),
    domain,
    title,
    action: "visit",
    isActive: true
  });

  await newActivity.save();
  return newActivity;
}

// Update activity session with duration
async function updateActivitySession(sessionId, duration) {
  await Activity.findOneAndUpdate(
    { sessionId, isActive: true },
    {
      duration: duration || 0,
      updatedAt: new Date()
    }
  );
}

// End activity session
async function endActivitySession(sessionId, endTime, finalDuration) {
  await Activity.findOneAndUpdate(
    { sessionId, isActive: true },
    {
      endTime: endTime ? new Date(endTime) : new Date(),
      duration: finalDuration || 0,
      isActive: false,
      action: "close"
    }
  );
}

// Create a complete activity record (legacy support)
async function createActivity(userId, tabId, url, domain, title, duration) {
  const sessionId = `${userId}_${tabId}_${Date.now()}`;
  const now = new Date();

  const newActivity = new Activity({
    userId,
    url,
    tabId,
    sessionId,
    startTime: new Date(now.getTime() - (duration || 0)),
    endTime: now,
    duration: duration || 0,
    domain,
    title,
    action: "visit",
    isActive: false
  });

  await newActivity.save();
  return newActivity;
}

// Get user's activity summary
export const getActivitySummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, groupBy = "domain" } = req.query;

    const matchQuery = { userId };

    if (startDate || endDate) {
      matchQuery.startTime = {};
      if (startDate) matchQuery.startTime.$gte = new Date(startDate);
      if (endDate) matchQuery.startTime.$lte = new Date(endDate);
    }

    const pipeline = [
      { $match: matchQuery },
      {
        $group: {
          _id: groupBy === "domain" ? "$domain" : "$url",
          totalDuration: { $sum: "$duration" },
          sessionCount: { $sum: 1 },
          lastVisit: { $max: "$startTime" }
        }
      },
      { $sort: { totalDuration: -1 } },
      { $limit: 50 }
    ];

    const summary = await Activity.aggregate(pipeline);

    res.json({
      success: true,
      data: summary,
      totalRecords: summary.length
    });
  } catch (error) {
    console.error("Error getting activity summary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get activity summary"
    });
  }
};
