import Activity from "../models/activity.model.js";
import { extractDomain } from "../utils/extractDomain.js";
import categorizeDomain from "../utils/category.util.js";

// Log activity (called by extension or frontend)
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

    switch (action) {
      case "start":
        await startActivitySession(req.user.id, tabId, url, domain, title, sessionId);
        break;

      case "update":
        await updateActivitySession(sessionId, duration);
        break;

      case "end":
        await endActivitySession(sessionId, endTime, duration);
        break;

      default:
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

// Start a new session-based activity
async function startActivitySession(userId, tabId, url, domain, title, sessionId) {
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
}

// Update existing session (typically with duration)
async function updateActivitySession(sessionId, duration) {
  await Activity.findOneAndUpdate(
    { sessionId, isActive: true },
    {
      duration: duration || 0,
      updatedAt: new Date()
    }
  );
}

// End a session
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

// One-off log without session
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
}

// ✅ Summary of activity grouped by domain or URL
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

    res.status(200).json({
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

// ✅ NEW: Summary of activity grouped by category
export const getActivitySummaryByCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const matchQuery = { userId };
    if (startDate || endDate) {
      matchQuery.startTime = {};
      if (startDate) matchQuery.startTime.$gte = new Date(startDate);
      if (endDate) matchQuery.startTime.$lte = new Date(endDate);
    }

    const activities = await Activity.find(matchQuery);

    const summaryMap = {};

    for (const activity of activities) {
      const category = categorizeDomain(activity.domain);
      if (!summaryMap[category]) {
        summaryMap[category] = {
          totalDuration: 0,
          sessionCount: 0,
          lastVisit: null
        };
      }

      summaryMap[category].totalDuration += activity.duration || 0;
      summaryMap[category].sessionCount += 1;
      if (
        !summaryMap[category].lastVisit ||
        activity.startTime > summaryMap[category].lastVisit
      ) {
        summaryMap[category].lastVisit = activity.startTime;
      }
    }

    const summary = Object.entries(summaryMap).map(([category, data]) => ({
      category,
      ...data
    }));

    summary.sort((a, b) => b.totalDuration - a.totalDuration);

    res.status(200).json({
      success: true,
      data: summary,
      totalRecords: summary.length
    });
  } catch (error) {
    console.error("Error getting category summary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get activity summary by category"
    });
  }
};
