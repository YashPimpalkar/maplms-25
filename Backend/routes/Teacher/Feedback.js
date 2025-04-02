import express from "express";

import { adminAuth, teacherAuth, verifyToken } from "../../middleware/auth.js";
import { getFeedbackStatus, UpdateFeedbackStatus, UploadFeedbackQuestions } from "../../controller/Teacher/Feedback.js";


const router = express.Router();

router.post("/upload",verifyToken,teacherAuth,UploadFeedbackQuestions);
router.put("/status/:usercourseid",verifyToken,teacherAuth,UpdateFeedbackStatus);
router.get("/status/:usercourseid",verifyToken,teacherAuth,getFeedbackStatus);

export default router;
