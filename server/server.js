// Load environment variables from root
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

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
import domainRouter from "./routes/domain.route.js"; // For domain time tracking

import cron from "node-cron";
import { deleteOldActivity } from "./utils/dataCleanup.js";

// App setup
const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Enable CORS for frontend
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
  })
);

// Parse JSON
app.use(express.json());

// Session management
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/tracking", trackingRouter);
app.use("/api/activity", activityRouter); // Activity logging
app.use("/api/domain", domainRouter); // Time tracking

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is running!" });
});

// Start server
app.listen(port, () => {

  connectDB();
  console.log("✅ Connected to MongoDB");
  console.log(`🚀 Server listening on port ${port}`);

  // Run automatic cleanup every day at 12 AM
  cron.schedule("0 0 * * *", () => {
    console.log("🕛 Running automatic data cleanup...");
    deleteOldActivity();
  });

});
