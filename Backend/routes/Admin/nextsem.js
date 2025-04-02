import express from "express";
import { nextSemester } from "../../controller/Admin/nextsem.js";
import { adminAuth, verifyToken } from "../../middleware/auth.js";


const router = express.Router();

router.post("/admin/nextsem",verifyToken,adminAuth, nextSemester);

export default router;
