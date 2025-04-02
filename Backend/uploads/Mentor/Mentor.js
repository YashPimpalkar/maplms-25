import express from "express";
import { teacherAuth, verifyToken } from "../../../middleware/auth.js";
import { downloadMenteeCertificationFile, downloadMenteeInternshipFile, downloadMenteeResumeFile, get_mentee_certifications, get_mentee_internships, get_mentee_resumes, getMentorDetails, getStudentDetails, getStudentsByMmrId } from "../../../controller/Teacher/Mentor/Mentor.js";


const router = express.Router();

router.get("/get-mentor-groups/:mentorId",getMentorDetails);
router.get("/get-students/:mmr_id", getStudentsByMmrId);
router.get("/get-performance/:student_id", getStudentDetails)

router.get("/get-internships/:sid", get_mentee_internships);
router.get("/internships/download/:filePath(*)", downloadMenteeInternshipFile);
router.get("/get-certifications/:sid", get_mentee_certifications);

// 📌 Download Certification File
router.get("/certifications/download/:filePath(*)", downloadMenteeCertificationFile);
// 📌 Get Mentee Resumes
router.get("/get-resumes/:sid", get_mentee_resumes);

// 📌 Download Resume File
router.get("/resumes/download/:filePath(*)", downloadMenteeResumeFile);
export default router;
