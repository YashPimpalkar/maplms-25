import express from "express";
import { createOrFetchAttendance, getAllAttendance, getDates, getStudentAttendanceAtClassRoom, getStudentAttendancePercentage, submitAttendance } from "../../../controller/Teacher/LMS/Attendance.js";

const router = express.Router();

router.get("/getDates/:id", getDates);
router.post("/getattendance", createOrFetchAttendance);
router.get("/getattendance/:id", getAllAttendance);

router.post("/submitattendance", submitAttendance);

router.get("/percentage/:sid/:classroom_id", getStudentAttendancePercentage);
router.get("/attandance/:sid/:classroom_id", getStudentAttendanceAtClassRoom);
export default router;