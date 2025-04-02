import express from "express";
import multer from "multer";

import { adminAuth, verifyToken } from "../../middleware/auth.js";
import { assignMentor, fetch_all_branch_students, getAcademicData,upload, submitAcademicData, upload_mentee_interships, get_mentee_internships, downloadMenteeInternshipFile, upload_mentee_certifications, get_mentee_certifications, downloadMenteeCertificationFile, upload2, upload_mentee_resume, get_mentee_resumes, downloadMenteeResumeFile, upload3, upload_mentee_marksheet, get_mentee_marksheets, downloadMenteeMarksheetFile, upload4 } from "../../controller/Admin/MentorMentee.js";


const storage = multer.diskStorage({
    destination: "./uploads/Mentee_Internships",
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    },
  });


  
const router = express.Router();

router.post("/admin/students/:uid",verifyToken,adminAuth, fetch_all_branch_students);
router.post("/admin/assign-mentor",verifyToken, assignMentor);
router.post("/submit-academic-data/:sid", submitAcademicData);
router.get("/get-academic-data/:sid", getAcademicData);
router.post("/mentee/upload-internships/:sid",upload.single("file") ,upload_mentee_interships);
router.get("/mentee/get-internships/:sid", get_mentee_internships);
router.get("/mentee/internships/download/:filePath(*)", downloadMenteeInternshipFile);

router.post("/mentee/upload-certifications/:sid", upload2.single("file"), upload_mentee_certifications);

// 📌 Get Mentee Certifications
router.get("/mentee/get-certifications/:sid", get_mentee_certifications);

// 📌 Download Certification File
router.get("/mentee/certifications/download/:filePath(*)", downloadMenteeCertificationFile);

router.post("/mentee/upload-resume/:sid", upload3.single("file"), upload_mentee_resume);

// 📌 Get Mentee Resumes
router.get("/mentee/get-resumes/:sid", get_mentee_resumes);

// 📌 Download Resume File
router.get("/mentee/resumes/download/:filePath(*)", downloadMenteeResumeFile);

router.post("/mentee/upload-marksheet/:sid", upload4.single("file"), upload_mentee_marksheet);

// 📌 Get Mentee Marksheets
router.get("/mentee/get-marksheets/:sid", get_mentee_marksheets);

// 📌 Download Marksheet File
router.get("/mentee/marksheets/download/:filePath(*)", downloadMenteeMarksheetFile);

export default router;
