import Activity from "../models/activity.model.js";
import { extractDomain } from "../utils/extractDomain.js"; // helper 

export const logActivity = async (req, res) => {
  try {
    const { tabId, url, timestamp, duration } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const domain = extractDomain(url); // Parse domain from full URL

    const newActivity = new Activity({
      userId: req.user.id,
      url,
      tabId,
      timestamp: new Date(timestamp),
      duration,
      domain
    });

    await newActivity.save();

    res.status(201).json({
      success: true,
      message: "Activity logged successfully",
      data: newActivity
    });
  } catch (error) {
    console.error("Activity logging failed:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
