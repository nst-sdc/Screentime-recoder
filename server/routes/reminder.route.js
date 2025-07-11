import express from "express";
import {
  addReminder,
  getUserReminders,
  deleteReminder,
  updateReminder,
} from "../controllers/reminder.controller.js";
import { verifyToken } from "../middleware/auth.js";  

const router = express.Router();

router.post("/add", verifyToken, addReminder);
router.get("/user", verifyToken, getUserReminders); 
router.delete("/:id", verifyToken, deleteReminder); 
router.put("/:id", verifyToken, updateReminder); 

export default router; 
