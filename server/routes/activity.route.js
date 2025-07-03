import express from "express";
import { logActivity } from "../controllers/activity.controller.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// POST /api/activity - for tracking app usage
router.post("/", verifyToken, logActivity);

// GET route just to check if route is working (optional)
router.get("/", (req, res) => {
    res.status(200).json({ message: "Activity route works!" });
});

export default router;
