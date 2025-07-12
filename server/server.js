import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import path from "path";
import { fileURLToPath } from "url";
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
import reminderRouter from "./routes/reminder.route.js";

const app = express();
const port = process.env.PORT || 3000;

connectDB();

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

app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/tracking", trackingRouter);
app.use("/api/activity", activityRouter);
app.use("/api/domain", domainRouter);
app.use("/api/reminders", reminderRouter);

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is running!" });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

import http from "http";
import { Server as SocketIOServer } from "socket.io";

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

server.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on http://0.0.0.0:${port}`);
});
