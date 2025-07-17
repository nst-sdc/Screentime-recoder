import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  toggleReminder,
  triggerReminder,
  blockDomain,
  unblockDomain,
  getBlockedDomains,
  checkDomainBlocked,
  blockDomainDirect,
  unblockDomainDirect
} from "../controllers/reminder.controller.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Reminder CRUD operations
router.get("/", getReminders);
router.post("/", createReminder);
router.put("/:id", updateReminder);
router.delete("/:id", deleteReminder);

// Reminder control operations
router.patch("/:id/toggle", toggleReminder);
router.post("/:id/trigger", triggerReminder);

// Domain blocking operations
router.post("/:id/block", blockDomain);
router.post("/:id/unblock", unblockDomain);
router.get("/blocked-domains", getBlockedDomains);
router.get("/check-blocked/:domain", checkDomainBlocked);

// Direct domain blocking operations (for extension)
router.post("/block-domain", blockDomainDirect);
router.post("/unblock-domain", unblockDomainDirect);

export default router;
