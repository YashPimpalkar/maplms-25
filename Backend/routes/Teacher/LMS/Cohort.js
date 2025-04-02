import express from "express";

import { teacherAuth, verifyToken } from "../../../middleware/auth.js";
import { assignStudentsToCohort, createCohort, deleteCohort, Get_All_Students, get_cohort_name, getAllCohortsbyUID, getCohortById, getCohortStudents, removeAllStudentsFromCohort, removeStudentFromCohort, updateCohort } from "../../../controller/Teacher/LMS/Cohort.js";


const router = express.Router();
router.post("/",verifyToken,teacherAuth, createCohort);
router.get("/show/:uid",verifyToken,teacherAuth,getAllCohortsbyUID)
router.get("/cohortname/:cohort_id",verifyToken,teacherAuth, get_cohort_name);
router.get("/getallstudents",verifyToken,teacherAuth, Get_All_Students);

router.post("/assignstudents/:cohort_id",verifyToken,teacherAuth, assignStudentsToCohort);
router.get("/cohortstudents/:cohort_id",verifyToken,teacherAuth, getCohortStudents);
router.delete("/removestudent/:cohortId/:studentId",verifyToken,teacherAuth, removeStudentFromCohort);
router.delete("/deletestudents/:cohortId",verifyToken,teacherAuth, removeAllStudentsFromCohort);

router.put("/:id",verifyToken,teacherAuth, updateCohort);
router.delete("/:id",verifyToken,teacherAuth, deleteCohort);
router.get("/:id",verifyToken,teacherAuth, getCohortById);

export default router;