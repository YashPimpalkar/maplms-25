import express from "express";
import { saveOrUpdateAttainment } from "../../controller/Teacher/Attainment.js";
import { teacherAuth, verifyToken } from "../../middleware/auth.js";
const router = express.Router();

router.post("/update",verifyToken,teacherAuth, saveOrUpdateAttainment);

export default router;