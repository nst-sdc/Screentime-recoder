import mongoose from "mongoose";
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
      endTime,
      tabName
    } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!action) {
      return res.status(400).json({ success: false, message: "Action is required" });
    }

    if (!url && action === "start") {
      return res.status(400).json({ success: false, message: "URL is required for start action" });
    }

    if (!sessionId && (action === "update" || action === "end")) {
      return res.status(400).json({ success: false, message: "SessionId is required for update/end actions" });
    }

    let domain = null;
    if (url) {
      domain = extractDomain(url);
      if (!domain) {
        return res.status(400).json({ success: false, message: "Invalid URL" });
      }
    }

    switch (action) {
      case "start":
        await startActivitySession(
          req.user.id,
          tabId,
          url,
          domain,
          title,
          sessionId,
          tabName 
        );
        break;

      case "update":
        await updateActivitySession(sessionId, duration);
        break;

      case "end":
        await endActivitySession(sessionId, endTime, duration);
        break;

      default:
        await createActivity(
          req.user.id,
          tabId,
          url,
          domain,
          title,
          duration,
          tabName 
        );
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

async function startActivitySession(
  userId,
  tabId,
  url,
  domain,
  title,
  sessionId,
  tabName 
) {
  const newActivity = new Activity({
    userId,
    url,
    tabId: tabId || 0,
    sessionId: sessionId || `${userId}_${tabId || 0}_${Date.now()}`,
    startTime: new Date(),
    domain,
    title: title || '',
    tabName: tabName || '', 
    action: "visit",
    isActive: true
  });

  await newActivity.save();
  return newActivity;
}

async function updateActivitySession(sessionId, duration) {
  const result = await Activity.findOneAndUpdate(
    { sessionId, isActive: true },
    {
      duration: duration || 0,
      updatedAt: new Date()
    }
  );

  if (!result) {
    console.warn("No active session found for sessionId:", sessionId);
  }

  return result;
}

async function endActivitySession(sessionId, endTime, finalDuration) {
  const result = await Activity.findOneAndUpdate(
    { sessionId, isActive: true },
    {
      endTime: endTime ? new Date(endTime) : new Date(),
      duration: finalDuration || 0,
      isActive: false,
      action: "close"
    }
  );

  if (!result) {
    console.warn("No active session found for sessionId:", sessionId);
  }

  return result;
}

async function createActivity(userId, tabId, url, domain, title, duration, tabName) {
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
    tabName: tabName || '', 
    action: "visit",
    isActive: false
  });

  await newActivity.save();
  return newActivity;
}

export const getActivitySummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, groupBy = "domain" } = req.query;

    const matchQuery = {
      userId: new mongoose.Types.ObjectId(userId),
    };

    if (startDate || endDate) {
      matchQuery.startTime = {};
      if (startDate) matchQuery.startTime.$gte = new Date(startDate);
      if (endDate) matchQuery.startTime.$lte = new Date(endDate);
    }

    const pipeline = [
      { $match: matchQuery },
      {
        $group: {
          _id: groupBy === "url" ? "$url" : "$domain",
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

export const getLiveActivity = async (req, res) => {
  try {
    const activities = await Activity.find({
      userId: req.user.id,
      isActive: true
    }).sort({ startTime: -1 });

    const data = activities.map(a => ({
      sessionId: a.sessionId,
      domain: a.domain,
      url: a.url,
      title: a.title,
      tabName: a.tabName || "", 
      duration: a.duration,
      startTime: a.startTime
    }));

    return res.json({ success: true, data });
  } catch (err) {
    console.error("getLiveActivity error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
