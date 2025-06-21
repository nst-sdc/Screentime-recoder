import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/user.route.js";

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

app.use("/api/users", userRouter);

app.listen(process.env.PORT || port, () => {
  connectDB();
  console.log("Connected to MongoDB");
  console.log(`Example app listening on port ${process.env.PORT || port}`);
});
