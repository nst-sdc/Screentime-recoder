import Activity from "../models/activity.model.js";
import { extractDomain } from "../utils/extractDomain.js";
import mongoose from "mongoose";
import redis from "../utils/redisClient.js";
// Log Activity Handler
export const logActivity = async (req, res) => {
  console.log("Received request:", req.body);
  console.log("Authenticated user ID:", req.user?.id);

  try {
    console.log("Activity log request:", req.body);
    console.log("User:", req.user?.id);
    
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
      console.error(" Unauthorized - no user in request");
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    let domain = null;
    if (url) {
      domain = extractDomain(url);
    }

    if (action === "start" && !domain) {
      return res.status(400).json({ success: false, message: "Invalid URL on start" });
    }
    if (!action) {
      console.error(" Missing action field");
      return res.status(400).json({ success: false, message: "Action is required" });
    }

    if (!url && action === "start") {
      console.error("Missing URL for start action");
      return res.status(400).json({ success: false, message: "URL is required for start action" });
    }

    if (!sessionId && (action === "update" || action === "end")) {
      console.error(" Missing sessionId for update/end action");
      return res.status(400).json({ success: false, message: "SessionId is required for update/end actions" });
    }

    // Extract domain only if URL is provided
    let domain = null;
    if (url) {
      domain = extractDomain(url);
      if (!domain) {
        console.error("Invalid URL:", url);
        return res.status(400).json({ success: false, message: "Invalid URL" });
      }
    }

    let activity;
    switch (action) {
      case "start":
        await startActivitySession(req.user.id, tabId, url, domain, title, sessionId);
        break;
      case "update":
        await updateActivitySession(sessionId, duration);
        break;
      case "end":
        console.log("🔄 Updating session:", sessionId);
        await updateActivitySession(sessionId, duration);
        break;
      case "end":
        
        console.log("🔴 Ending session:", sessionId);
        await endActivitySession(sessionId, endTime, duration);
        break;
      default:
        await createActivity(req.user.id, tabId, url, domain, title, duration);
    }

    res.status(201).json({ success: true, message: "Activity logged successfully" });
        
        console.log("📝 Creating legacy activity record");
        await createActivity(req.user.id, tabId, url, domain, title, duration);
    }

    console.log("✅ Activity logged successfully");
    res.status(201).json({
      success: true,
      message: "Activity logged successfully"
    });
  } catch (error) {
    console.error("❌ Activity logging failed:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

async function startActivitySession(userId, tabId, url, domain, title, sessionId) {
async function startActivitySession(
  userId,
  tabId,
  url,
  domain,
  title,
  sessionId
) {
  if (!url || !domain) {
    throw new Error("URL and domain are required for starting a session");
  }
  const newActivity = new Activity({
    userId,
    url,
    tabId: tabId || 0,
    sessionId: sessionId || `${userId}_${tabId || 0}_${Date.now()}`,
    startTime: new Date(),
    domain,
    title: title || '',
    action: "visit",
    isActive: true
  });
  try {
    await newActivity.save();
    console.log(" MongoDB save SUCCESS");
  } catch (err) {
    console.error("MongoDB save FAILED:", err);
  }
  await newActivity.save();
  console.log("Started new activity session:", newActivity.sessionId);
  return newActivity;
}

async function updateActivitySession(sessionId, duration) {
  if (!sessionId) {
    throw new Error("SessionId is required for updating a session");
  }

  const result = await Activity.findOneAndUpdate(
    { sessionId, isActive: true },
    {
      duration: duration || 0,
      updatedAt: new Date()
    }
  );

  if (!result) {
    console.warn("⚠ No active session found for sessionId:", sessionId);
  } else {
    console.log(" Updated activity session:", sessionId, "duration:", duration);
  }
  
  return result;
}

async function endActivitySession(sessionId, endTime, finalDuration) {
  if (!sessionId) {
    throw new Error("SessionId is required for ending a session");
  }

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
    console.warn("⚠️ No active session found for sessionId:", sessionId);
  } else {
    console.log("🔴 Ended activity session:", sessionId, "duration:", finalDuration);
  }
  
  return result;
}

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

// ---------------------- Summary API -----------------------

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
    const data = await Activity.aggregate([
      { $match: { userId } },
      { $group: { _id: "$domain", totalDuration: { $sum: "$duration" }, sessionCount: { $sum: 1 }, lastVisit: { $max: "$startTime" } } },
      { $sort: { totalDuration: -1 } }
    ]);
    return res.json({ success: true, data });
  } catch (err) {
    console.error("getActivitySummary error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getLiveActivity = async (req, res) => {
  try {
    const activities = await Activity.find({ userId: req.user.id, isActive: true }).sort({ startTime: -1 });
    const data = activities.map(a => ({
      sessionId: a.sessionId,
      domain: a.domain,
      url: a.url,
      title: a.title,
      duration: a.duration,
      startTime: a.startTime
    }));
    return res.json({ success: true, data });
  } catch (err) {
    console.error("getLiveActivity error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
