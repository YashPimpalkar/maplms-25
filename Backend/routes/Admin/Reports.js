import express from "express";
import { academic_year_wise_branch_users, avarages_popso, cosresultsreports, CourseOutcomeWise_Report, coursewise_set_reports, coursewise_target_reports, get_usercourses_by_branch, progress_tracker, semsterwisereport, teacher_report_acdemic_year_wise } from "../../controller/Admin/Reports.js";
import { verifyToken } from "../../middleware/auth.js";

// import { nextSemester } from "../../controller/Admin/nextsem.js";



const router = express.Router();

router.get("/coursewise/set/:uid",verifyToken, coursewise_set_reports);
router.get("/coursewise/target/:uid",verifyToken,coursewise_target_reports );
router.get("/courseoutcome/:uid",verifyToken, CourseOutcomeWise_Report );
router.get("/getuserbybranch/:uid",verifyToken,academic_year_wise_branch_users );
router.get("/getteachercouser/:uid",verifyToken,teacher_report_acdemic_year_wise );
router.get("/getprogress/:uid",progress_tracker );
router.get("/getusercoursebybranch/:uid",get_usercourses_by_branch);
router.get("/getcourseresult/:uid",cosresultsreports);
router.get("/getaverages/:uid",avarages_popso);
router.get("/getsemesterwiseuid/:uid",semsterwisereport)
export default router;