import mongoose from "mongoose";
import Activity from "../models/activity.model.js";
import Category from "../models/category.model.js";
import { extractDomain } from "../utils/extractDomain.js";
import geminiService from "../services/geminiService.js";

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
        await startActivitySessionWithGemini(
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
        await createActivityWithGemini(
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

async function startActivitySessionWithGemini(
  userId,
  tabId,
  url,
  domain,
  title,
  sessionId,
  tabName 
) {
  let analysis = null;
  let category = null;
  
  try {
    analysis = await geminiService.categorizeActivity(url, title, domain);
    category = await Category.findOne({ name: analysis.category });
  } catch (error) {
    console.warn("Gemini categorization failed, using fallback:", error.message);
    analysis = {
      category: "Unknown",
      confidence: 0.3,
      reasoning: "Gemini categorization failed",
      productivityScore: 5,
      tags: [domain.split(".")[0]]
    };
  }

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
    isActive: true,
    category: category?._id,
    categoryName: analysis.category,
    aiAnalysis: analysis,
    tags: analysis.tags,
    productivityScore: analysis.productivityScore
  });

  await newActivity.save();
  
  return newActivity;
}

async function createActivityWithGemini(userId, tabId, url, domain, title, duration, tabName) {
  let analysis = null;
  let category = null;
  
  try {
    analysis = await geminiService.categorizeActivity(url, title, domain);
    category = await Category.findOne({ name: analysis.category });
  } catch (error) {
    console.warn("Gemini categorization failed, using fallback:", error.message);
    analysis = {
      category: "Unknown",
      confidence: 0.3,
      reasoning: "Gemini categorization failed",
      productivityScore: 5,
      tags: [domain.split(".")[0]]
    };
  }

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
    isActive: false,
    category: category?._id,
    categoryName: analysis.category,
    aiAnalysis: analysis,
    tags: analysis.tags,
    productivityScore: analysis.productivityScore
  });

  await newActivity.save();
  
  return newActivity;
}

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

export const getCategoryAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, period = "day" } = req.query;

    const matchQuery = {
      userId: new mongoose.Types.ObjectId(userId),
      categoryName: { $exists: true, $ne: null }
    };

    if (startDate || endDate) {
      matchQuery.startTime = {};
      if (startDate) matchQuery.startTime.$gte = new Date(startDate);
      if (endDate) matchQuery.startTime.$lte = new Date(endDate);
    }

    // Category breakdown
    const categoryPipeline = [
      { $match: matchQuery },
      {
        $group: {
          _id: "$categoryName",
          totalDuration: { $sum: "$duration" },
          sessionCount: { $sum: 1 },
          avgProductivityScore: { $avg: "$productivityScore" },
          domains: { $addToSet: "$domain" }
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "name",
          as: "categoryInfo"
        }
      },
      {
        $addFields: {
          categoryInfo: { $arrayElemAt: ["$categoryInfo", 0] }
        }
      },
      { $sort: { totalDuration: -1 } }
    ];

    const categoryStats = await Activity.aggregate(categoryPipeline);

    // Time-based breakdown
    let groupByFormat;
    switch (period) {
      case "hour":
        groupByFormat = { $dateToString: { format: "%Y-%m-%d %H:00", date: "$startTime" } };
        break;
      case "week":
        groupByFormat = { $dateToString: { format: "%Y-W%U", date: "$startTime" } };
        break;
      case "month":
        groupByFormat = { $dateToString: { format: "%Y-%m", date: "$startTime" } };
        break;
      default:
        groupByFormat = { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } };
    }

    const timePipeline = [
      { $match: matchQuery },
      {
        $group: {
          _id: {
            period: groupByFormat,
            category: "$categoryName"
          },
          duration: { $sum: "$duration" }
        }
      },
      {
        $group: {
          _id: "$_id.period",
          categories: {
            $push: {
              category: "$_id.category",
              duration: "$duration"
            }
          },
          totalDuration: { $sum: "$duration" }
        }
      },
      { $sort: { "_id": 1 } }
    ];

    const timeStats = await Activity.aggregate(timePipeline);

    res.status(200).json({
      success: true,
      data: {
        categoryBreakdown: categoryStats,
        timeBreakdown: timeStats,
        period
      }
    });
  } catch (error) {
    console.error("Error getting category analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get category analytics"
    });
  }
};

export const getProductivityInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 7 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const matchQuery = {
      userId: new mongoose.Types.ObjectId(userId),
      startTime: { $gte: startDate },
      productivityScore: { $exists: true }
    };

    // Overall productivity metrics
    const productivityPipeline = [
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          avgProductivity: { $avg: "$productivityScore" },
          totalDuration: { $sum: "$duration" },
          productiveDuration: {
            $sum: {
              $cond: [{ $gte: ["$productivityScore", 7] }, "$duration", 0]
            }
          },
          unproductiveDuration: {
            $sum: {
              $cond: [{ $lte: ["$productivityScore", 3] }, "$duration", 0]
            }
          }
        }
      },
      {
        $addFields: {
          productivityRatio: {
            $cond: {
              if: { $gt: ["$totalDuration", 0] },
              then: { $divide: ["$productiveDuration", "$totalDuration"] },
              else: 0
            }
          }
        }
      }
    ];

    // Daily productivity trends
    const dailyTrendPipeline = [
      { $match: matchQuery },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
          avgProductivity: { $avg: "$productivityScore" },
          totalDuration: { $sum: "$duration" },
          sessionCount: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ];

    // Top productive and unproductive domains
    const domainPipeline = [
      { $match: matchQuery },
      {
        $group: {
          _id: "$domain",
          avgProductivity: { $avg: "$productivityScore" },
          totalDuration: { $sum: "$duration" },
          category: { $first: "$categoryName" }
        }
      },
      { $sort: { totalDuration: -1 } },
      { $limit: 20 }
    ];

    const [productivityMetrics, dailyTrends, domainStats] = await Promise.all([
      Activity.aggregate(productivityPipeline),
      Activity.aggregate(dailyTrendPipeline),
      Activity.aggregate(domainPipeline)
    ]);

    // Separate productive and unproductive domains
    const productiveDomains = domainStats
      .filter(d => d.avgProductivity >= 7)
      .sort((a, b) => b.totalDuration - a.totalDuration)
      .slice(0, 5);

    const unproductiveDomains = domainStats
      .filter(d => d.avgProductivity <= 3)
      .sort((a, b) => b.totalDuration - a.totalDuration)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        overview: productivityMetrics[0] || {},
        dailyTrends,
        topProductiveDomains: productiveDomains,
        topUnproductiveDomains: unproductiveDomains,
        period: `${days} days`
      }
    });
  } catch (error) {
    console.error("Error getting productivity insights:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get productivity insights"
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error("Error getting categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get categories"
    });
  }
};

export const recategorizeActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 1 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Find uncategorized activities
    const uncategorizedActivities = await Activity.find({
      userId: new mongoose.Types.ObjectId(userId),
      startTime: { $gte: startDate },
      categoryName: { $exists: false }
    }).limit(50);

    let processedCount = 0;

    for (const activity of uncategorizedActivities) {
      try {
        const analysis = await geminiService.categorizeActivity(
          activity.url,
          activity.title,
          activity.domain
        );

        const category = await Category.findOne({ name: analysis.category });

        await Activity.findByIdAndUpdate(activity._id, {
          category: category?._id,
          categoryName: analysis.category,
          aiAnalysis: analysis,
          tags: analysis.tags,
          productivityScore: analysis.productivityScore
        });

        processedCount++;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error recategorizing activity ${activity._id}:`, error);
      }
    }

    res.status(200).json({
      success: true,
      message: `Recategorized ${processedCount} activities`,
      processedCount,
      totalFound: uncategorizedActivities.length
    });
  } catch (error) {
    console.error("Error recategorizing activities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to recategorize activities"
    });
  }
};
