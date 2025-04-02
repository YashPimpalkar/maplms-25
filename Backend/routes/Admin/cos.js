import express from "express";
import { add_cos_from_admin, get_courses, remove_cos_from_admin, show_cos_for_admin, update_Cos } from "../../controller/Admin/cos.js";
import { adminAuth, verifyToken } from "../../middleware/auth.js";


const router = express.Router();

// router.post("/add", addcos);

// router.post("/:uid", show_cos);

router.get("/admin/courses",verifyToken,adminAuth, get_courses);

router.get("/admin/showcos/:uid", show_cos_for_admin);



router.post("/admin/add/:uid", add_cos_from_admin);

router.put("/admin/update/:uid", update_Cos);

router.delete("/admin/remove/:uid", remove_cos_from_admin);

export default router;
