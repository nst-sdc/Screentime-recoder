import express from 'express';
import { saveTrackingData } from '../controllers/tracking.controller.js';

const router = express.Router();

router.post('/', saveTrackingData);

export default router;
