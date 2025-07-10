import express from "express";
import {
  addReminder,
  getUserReminders,
  deleteReminder,
  updateReminder,
} from "../controllers/reminder.controller.js";
import authenticate from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/add", authenticate, addReminder);
router.get("/user", authenticate, getUserReminders);
router.delete("/:id", authenticate, deleteReminder);
router.put("/:id", authenticate, updateReminder);

export default router;
