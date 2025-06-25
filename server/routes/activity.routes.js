import express from 'express'
import {validateRequest} from '../middleware/validateRequest.js'
import {userActivityValidationSchema} from '../middleware/validators/userActivity.validator.js';
import { logActivity } from '../controllers/activity.controller.js';

const router = express.Router()

router.post('/',validateRequest(userActivityValidationSchema),logActivity);//checking validation befor saving data in moongodb

export default router