import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

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

// Parse JSON bodies
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

// Initialize Passport for authentication
app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/tracking", trackingRouter);
app.use("/api/activity", activityRouter); // Activity logging
app.use("/api/domain", domainRouter); // Time tracking

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is running!" });
});

// Start the server on 0.0.0.0 to allow external access (for Chrome extensions, etc.)
app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server listening on http://0.0.0.0:${port}`);
});
