import express from "express";
import { trackTime } from "../controllers/track.controller.js";

const router = express.Router();

router.post("/", trackTime);

export default router;
