import express from "express";
import Activity from "../models/Activity.js";
import User from "../models/user.model.js";
import { categorizeDomain } from "../utils/category.util.js";
import { logActivity } from "../controllers/activity.controller.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// POST /api/activity
router.post("/", verifyToken, logActivity);

// POST /api/activity/track
router.post("/track", verifyToken, async (req, res) => {
  const { userId, url, action } = req.body;

  const category = categorizeDomain(url);

  const newActivity = new Activity({
    userId,
    url,
    action,
    category,
  });

  try {
    await newActivity.save();

    // Update the user's category based on visited website
    await User.findByIdAndUpdate(userId, { category });

    res.status(201).json({ message: "Activity recorded", category });
  } catch (err) {
    res.status(500).json({ error: "Failed to record activity" });
  }
});

export default router;