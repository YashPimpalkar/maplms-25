import express from "express";
import { addCourses } from "../../controller/Teacher/AddCourse.js";
import { adminAuth, teacherAuth, verifyToken } from "../../middleware/auth.js";

const router = express.Router();

router.post("/addcourses",verifyToken,adminAuth, addCourses);

export default router;
