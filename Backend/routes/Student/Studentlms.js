import express from "express";
import multer from "multer";
import { createSubmission, downloadFileForSubmission, get_all_classroom_by_sid, getAssignmentById, getClassroomActivities, getSubmissionsByAssignmentAndStudent, updateSubmissionMarks, updateSubmissionTimestamp } from "../../controller/Student/Studentlms.js";

const router = express.Router();
const upload = multer();
router.get("/getclassroom/:sid", get_all_classroom_by_sid);
router.post("/classroom/getactivities/:cid", getClassroomActivities);
router.post("/submission/:aid", createSubmission);
router.post(
  "/getsubmissions",
  upload.none(),
  getSubmissionsByAssignmentAndStudent
)
router.get("/submissions/download/:fileId", downloadFileForSubmission);
router.post("/submissions/marks/:submissionId", updateSubmissionMarks);
router.get("/submissions/:assignmentId", getAssignmentById);
router.post("/markasdone/:submission_id", updateSubmissionTimestamp);
export default router;
