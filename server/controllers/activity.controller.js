import Activity from "../models/activity.model.js";
import { extractDomain } from "../utils/extractDomain.js";
import redis from "../utils/redisClient.js";

export const logActivity = async (req, res) => {
  try {
    console.log("📊 Activity log request:", req.body);
    console.log("🔑 User:", req.user?.id);
    
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
      console.error("❌ Unauthorized - no user in request");
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Validate required fields based on action
    if (!action) {
      console.error("❌ Missing action field");
      return res.status(400).json({ success: false, message: "Action is required" });
    }

    if (!url && action === "start") {
      console.error("❌ Missing URL for start action");
      return res.status(400).json({ success: false, message: "URL is required for start action" });
    }

    if (!sessionId && (action === "update" || action === "end")) {
      console.error("❌ Missing sessionId for update/end action");
      return res.status(400).json({ success: false, message: "SessionId is required for update/end actions" });
    }

    // Extract domain only if URL is provided
    let domain = null;
    if (url) {
      domain = extractDomain(url);
      if (!domain) {
        console.error("❌ Invalid URL:", url);
        return res.status(400).json({ success: false, message: "Invalid URL" });
      }
    }

    // Handle different types of activity logging
    switch (action) {
      case "start":
        // Start a new activity session
        console.log("🟢 Starting new session");
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
        console.log("🔄 Updating session:", sessionId);
        await updateActivitySession(sessionId, duration);
        break;
      case "end":
        // End activity session
        console.log("🔴 Ending session:", sessionId);
        await endActivitySession(sessionId, endTime, duration);
        break;
      default:
        // Legacy support - create a complete activity record
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

// Start a new activity session
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

  await newActivity.save();
  console.log("✅ Started new activity session:", newActivity.sessionId);
  return newActivity;
}

// Update activity session with duration
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
    console.warn("⚠️ No active session found for sessionId:", sessionId);
  } else {
    console.log("🔄 Updated activity session:", sessionId, "duration:", duration);
  }
  
  return result;
}

// End activity session
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
