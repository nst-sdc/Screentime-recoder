import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "./config/passport.js";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import trackingRouter from "./routes/tracking.route.js";
import activityRouter from "./routes/activity.route.js";
import domainRouter from "./routes/domain.route.js";
import healthRouter from "./routes/health.route.js";
import validateApiKey from "./middleware/apiKey.middleware.js";

const app = express();
const port = process.env.PORT || 3000;

// Initialize database and categories
const initializeApp = async () => {
  await connectDB();
  setTimeout(async () => {
    try {
      const Category = (await import("./models/category.model.js")).default;
      await Category.initializeSystemCategories();
      console.log("System categories initialized");
    } catch (error) {
      console.error("Category initialization failed:", error);
    }
  }, 1000);
};

initializeApp();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://screentime-recoder.vercel.app",
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"]
  })
);
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Public routes
app.use("/api/auth", authRouter);
app.use("/api", healthRouter);

// Protected routes requiring API key
app.use("/api/test-protected", validateApiKey, staticTestRouter);

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is running!" });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on ${port}`);
});
