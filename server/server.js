import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "./config/passport.js";
import { connectDB } from "./config/db.js";

// Routes
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import trackingRouter from "./routes/tracking.route.js";
import activityRouter from "./routes/activity.route.js";
import domainRouter from "./routes/domain.route.js";
import reminderRouter from "./routes/reminder.route.js";

// App setup
const app = express();
const port = process.env.PORT || 3000;

// Connect to DB
connectDB();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/tracking", trackingRouter);
app.use("/api/activity", activityRouter);
app.use("/api/domain", domainRouter);
app.use("/api/reminders", reminderRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "✅ Server is running!" });
});

// Fallback route
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Socket + Redis Setup
import http from "http";
import { Server as SocketIOServer } from "socket.io";
// import redisClient from "./utils/redisClient.js";

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// If using Redis later
/*
const subscriber = redisClient.duplicate();
subscriber.subscribe("activityUpdates", (err, count) => {
  if (err) {
    console.error("Redis subscribe error:", err);
  } else {
    console.log(`✅ Subscribed to ${count} channel(s).`);
  }
});

subscriber.on("message", (channel, message) => {
  if (channel === "activityUpdates") {
    try {
      const data = JSON.parse(message);
      io.emit("activityUpdated", data);
    } catch (err) {
      console.error("Error parsing Redis message:", err);
    }
  }
});
*/

// Start Server
server.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server listening on http://0.0.0.0:${port}`);
});
