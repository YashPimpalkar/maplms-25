import express from "express";
// import { nextSemester } from "../../controller/Admin/nextsem.js";
import { adminAuth, verifyToken } from "../../middleware/auth.js";
import { academic_year, admin_branch, show_all_user } from "../../controller/Admin/Users.js";


const router = express.Router();

router.get("/",verifyToken, show_all_user);
router.get("/depart/:uid",verifyToken,admin_branch );
router.get("/getacademicyear/:uid",verifyToken,academic_year );
export default router;
