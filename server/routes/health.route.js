import express from "express";
import mongoose from "mongoose";
import { sendEmail } from "../services/emailService.js";

const router = express.Router();

router.get("/health", (req, res) => {
  const health = {
    status: "ok",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    service: "screentime-recorder-api",
    version: "1.0.0",
    database: {
      status:
        mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      readyState: mongoose.connection.readyState
    }
  };

  const statusCode = health.database.status === "connected" ? 200 : 503;
  res.status(statusCode).json(health);
});

// Detailed health check for monitoring
router.get("/health/detailed", (req, res) => {
  const detailed = {
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "screentime-recorder-api",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024)
    },
    database: {
      status:
        mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    }
  };

  const statusCode = detailed.database.status === "connected" ? 200 : 503;
  res.status(statusCode).json(detailed);
});

export default router;

// DEV-only: send a test email to verify SMTP configuration
// POST /api/health/send-test-email  { to: 'you@domain.com' }
if (process.env.NODE_ENV !== 'production') {
  router.post('/health/send-test-email', async (req, res) => {
    const { to } = req.body;
    if (!to) return res.status(400).json({ success: false, message: 'to field required' });

    try {
      await sendEmail({ to, subject: 'Test email from Screentime Recorder', text: 'This is a test email.' });
      return res.json({ success: true, message: `Test email sent to ${to}` });
    } catch (err) {
      console.error('send-test-email error', err);
      return res.status(500).json({ success: false, message: 'Failed to send test email', error: err.message });
    }
  });
}
