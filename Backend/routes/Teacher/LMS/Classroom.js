import express from "express";
import { addStudentsToClass, deleteAllStudentsFromClass, deleteStudentFromClass, fetch_cohorts_byuser, getClassroomDetails, getClassroomStudents, show_classroom } from "../../../controller/Teacher/LMS/Classroom.js";
import { teacherAuth, verifyToken } from "../../../middleware/auth.js";


const router = express.Router();

router.get("/show/:uid",verifyToken,teacherAuth, show_classroom);
// router.post("/create", upload_classroom);
// router.get("/show/:uid", show_classroom);
// router.delete("/delete/:id", delete_classroom);
router.get("/fetchcohorts/:uid", fetch_cohorts_byuser);

router.post("/assignstudents/:classId", addStudentsToClass);

// Delete All Students from Class
router.delete("/deletestudents/:classId/:tid", deleteAllStudentsFromClass);

// Delete One Student from Class
router.delete("/deletestudent/:sid/:classId/:tid", deleteStudentFromClass);

router.get("/fetchstudents/:classId", getClassroomStudents);

router.get("/classroom/:classroom_id", getClassroomDetails);



export default router;