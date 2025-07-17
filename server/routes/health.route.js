import express from "express";
import mongoose from "mongoose";

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
