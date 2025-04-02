import express from "express";
import { deletepos, editpos, savenewpos, showpos } from "../../controller/Teacher/Pos.js";
import { adminAuth, teacherANDAdminAuth, teacherAuth, verifyToken } from "../../middleware/auth.js";


const router = express.Router();

router.post("/show",verifyToken,teacherANDAdminAuth, showpos);
router.post("/admin/update",verifyToken,adminAuth, editpos);
router.delete("/admin/delete",verifyToken,adminAuth, deletepos);
router.post("/admin/create",verifyToken,adminAuth, savenewpos);

export default router;
