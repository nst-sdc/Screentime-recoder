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

import activityRouter from "./routes/activity.route.js"; // NEW updated 


dotenv.config();

import domainRouter from "./routes/domain.route.js"; // ✅ For domain time tracking
import activityRouter from "./routes/activity.route.js"; // ✅ New activity route


// App setup
const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Debug: Confirm env values are loaded
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);

// Enable CORS for frontend
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
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

app.use("/api/activity", activityRouter); // ✅ New activity endpoint


// Health Check

app.use("/api/domain", domainRouter); // ✅ Time tracking
app.use("/api/activity", activityRouter); // ✅ Activity logging

// Health check route

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "✅ Server is running!" });
});

// Start server
app.listen(port, () => {
  console.log("✅ Connected to MongoDB");
  console.log(`🚀 Server listening on port ${port}`);
});

