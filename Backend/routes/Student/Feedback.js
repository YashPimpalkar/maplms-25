import express from "express";
import { get_student_feedbacks, GetStudentFeedbackQuestions, UpdateMarksForQuestions } from "../../controller/Student/Feedback.js";

const router = express.Router();


router.get("/get_usercourse/:sid", get_student_feedbacks);
router.get("/questions/:sid", GetStudentFeedbackQuestions);
router.post("/updatemarks",UpdateMarksForQuestions)

export default router;
