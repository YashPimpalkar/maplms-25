import express, { Router } from "express";
import  { verifyToken,teacherAuth } from "../../middleware/auth.js"

import { coname, edit_specific_course, show_CoCount, show_specific_user_course, show_user_course, userCourse_details } from "../../controller/Teacher/UserCourse.js";
const router = express.Router();

// router.post("/",verifyToken,teacherAuth, user_course_registration);
router.get("/:uid",verifyToken,teacherAuth, show_user_course);
router.get("/cocount/:uid",verifyToken,teacherAuth, show_CoCount);
router.get("/coname/:uid",verifyToken,teacherAuth, coname);
router.get("/specific/:uid",verifyToken,teacherAuth, show_specific_user_course);
router.put("/edit/specific/:uid",verifyToken,teacherAuth, edit_specific_course);
router.get("/details/:uid",verifyToken,teacherAuth, userCourse_details);
// router.post("/admin/registration",verifyToken, user_course_registration_admin_side);[l;'p]
export default router;
