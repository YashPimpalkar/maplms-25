
import express from "express";
import { fetchTermwork, fetchTermworkLabels, get_curriculum, get_termworkbasetable, GetQuestionsAndCos, GetStudentMarks, getTermworkData, importExcelMarks, submitTermworkId, UpdateSingleRowMarks, UploadQuestions, WithOutCosdata } from "../../controller/Teacher/Termwork.js";
import { teacherAuth, verifyToken } from "../../middleware/auth.js";
const router = express.Router();

router.get("/checkboxlabels/:userCourseId",verifyToken,teacherAuth, fetchTermworkLabels);
router.post("/submit",verifyToken,teacherAuth, submitTermworkId);
router.get("/gettermworkdata/:usercourseid",verifyToken,teacherAuth, getTermworkData);
router.get("/getcurriculum",verifyToken,teacherAuth,get_curriculum);
router.get("/get-termwork-table",verifyToken,teacherAuth,get_termworkbasetable);
router.post("/upload-questions",verifyToken,teacherAuth,UploadQuestions);
router.get("/get-student-marks",verifyToken,teacherAuth,GetStudentMarks);
router.get("/get-questions-cos",verifyToken,teacherAuth,GetQuestionsAndCos);
router.get("/get-questions-withoutcos",verifyToken,teacherAuth,WithOutCosdata);
router.post("/saveMarks-singlerow",verifyToken,teacherAuth,UpdateSingleRowMarks );
router.post("/importexcelmarks",verifyToken,teacherAuth,importExcelMarks);
router.get("/:uid",verifyToken,teacherAuth,fetchTermwork);
export default router;