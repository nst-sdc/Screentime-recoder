import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

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
import reminderRouter from "./routes/reminder.route.js"; // ✅ Reminder Feature

// App setup
const app = express();
const port = process.env.PORT || 3000;

// Connect to DB
connectDB();

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

// JSON Parser
app.use(express.json());

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/tracking", trackingRouter);
app.use("/api/activity", activityRouter);
app.use("/api/domain", domainRouter);
app.use("/api/reminders", reminderRouter); // ✅ Reminder routes

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
import redisClient from "./utils/redisClient.js";

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

const subscriber = redisClient.duplicate();

subscriber.subscribe("activityUpdates", (err, count) => {
  if (err) {
    console.error("❌ Redis subscribe error:", err);
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
      console.error("❌ Error parsing Redis message:", err);
    }
  }
});

// Start Server
server.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
