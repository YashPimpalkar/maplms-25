import express from "express";
import { createActivity, createQuizForm, downloadFile, getActivitiesByClassroom, getActivityDetails, getQuizStudentDetailsByClassroom, getQuizzes, getSubmissionsByAssignment, insertQuizStudentForm, loadFile } from "../../../controller/Teacher/LMS/ClassroomActivities.js";
import { teacherAuth, verifyToken } from "../../../middleware/auth.js";

const router = express.Router();

router.post("/create/:classroom_id",verifyToken,teacherAuth, createActivity);

router.get("/show/:classroom_id", getActivitiesByClassroom);
router.get("/download/:fileId", downloadFile);
router.get("/download/:filename", loadFile);

router.get("/submissions/:assignmentId", getSubmissionsByAssignment);
router.get("/activities/:assignmentId", getActivityDetails);

router.post("/quiz", createQuizForm);
router.get("/quizzes/:classroomId/:sid", getQuizzes);
router.post("/quizzes/submit",insertQuizStudentForm);
router.get('/quiz-student-details/:classroomId', getQuizStudentDetailsByClassroom);
export default router;
