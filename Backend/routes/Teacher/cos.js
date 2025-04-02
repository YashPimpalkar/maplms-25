import express from "express";
import { add_cos_from_admin, addcos, get_courses, get_coursesby_user, remove_cos_from_admin, show_cos, show_cos_for_admin, update_Cos } from "../../controller/Teacher/cos.js";
import { adminAuth, teacherAuth, verifyToken } from "../../middleware/auth.js";


const router = express.Router();

router.post("/add",verifyToken,teacherAuth, addcos);

router.post("/:uid",verifyToken,teacherAuth, show_cos);

router.get("/courses/:uid", get_courses);


router.get("/usercourses/:uid", get_coursesby_user);



router.get("/admin/showcos/:uid", show_cos_for_admin);

router.post("/admin/add/:uid", add_cos_from_admin);

router.put("/admin/update/:uid", update_Cos);

router.delete("/admin/remove/:uid", remove_cos_from_admin);

export default router;
