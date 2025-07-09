import express from "express";
import {
  createUser,
  deleteUser,
  updateUser
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

// ✅ New route to store time spent
router.post("/time", async (req, res) => {
  try {
    const { domain, startTime, endTime } = req.body;

    if (!domain || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const duration = new Date(endTime) - new Date(startTime); // ms

    res.status(200).json({
      message: "Time tracked successfully",
      data: {
        domain,
        startTime,
        endTime,
        durationInSeconds: duration / 1000
      }
    });
  } catch (err) {
    console.error("Error tracking time:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
