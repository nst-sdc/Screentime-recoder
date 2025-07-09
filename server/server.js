// Load environment variables from root
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.join(__dirname, "../.env") });

// Core imports
import express from "express";
import cors from "cors";
import session from "express-session";

// Custom modules
import passport from "./config/passport.js";
import { connectDB } from "./config/db.js";

// Import routes
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import trackingRouter from "./routes/tracking.route.js";
import activityRouter from "./routes/activity.route.js";
import domainRouter from "./routes/domain.route.js";

// App setup
const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Enable CORS for frontend
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Parse incoming JSON
app.use(express.json());

// Session management
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/tracking", trackingRouter);
app.use("/api/activity", activityRouter); // ✅ LIVE data comes from this
app.use("/api/domain", domainRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "✅ Server is running!" });
});

// Fallback route for unmatched requests
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

import http from "http";
import { Server as SocketIOServer } from "socket.io";
import redisClient from "./utils/redisClient.js";

// Start server
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// Redis subscriber for activity updates
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
      console.log("📡 Publishing activity update to clients:", data);
      io.emit("activityUpdated", data);
    } catch (err) {
      console.error("❌ Error parsing Redis message:", err);
    }
  }
});

server.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
