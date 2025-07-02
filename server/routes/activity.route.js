import express from "express";
import { logActivity } from "../controllers/activity.controller.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// POST /api/activity
router.post("/", verifyToken, logActivity);

export default router; 
