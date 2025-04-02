import express from "express";
import { getStudentOverallAttendance } from "../../controller/Student/Attendance.js";
import { verifyToken } from "../../middleware/auth.js";

const router = express.Router();

// Route to get student's overall attendance
router.get("/overall/:sid", verifyToken, getStudentOverallAttendance);

export default router;