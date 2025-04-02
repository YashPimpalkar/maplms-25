import express from "express";
// import { nextSemester } from "../../controller/Admin/nextsem.js";
import { adminAuth, verifyToken } from "../../middleware/auth.js";
import { Academic_year, Show_Usercourse, user_course_registration } from "../../controller/Admin/UserCourse.js";



const router = express.Router();

router.post("/add",verifyToken,adminAuth, user_course_registration);
router.post("/show-usercourse/:uid",verifyToken,adminAuth,Show_Usercourse );
router.get("/academicyear",verifyToken,adminAuth,Academic_year);
export default router;
