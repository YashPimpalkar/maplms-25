import express from "express";
import { showCopo, showCourse, updateCopo,  updateCopo_set_averages } from "../../controller/Teacher/coposhow.js";
import { teacherAuth, verifyToken } from "../../middleware/auth.js";

const router = express.Router();
router.get("/:uid",verifyToken,teacherAuth, showCourse);
router.get("/show/:uid",verifyToken,teacherAuth, showCopo);
router.put("/update/:co_id",verifyToken,teacherAuth, updateCopo);
router.put("/set-averages/update/:uid",verifyToken, updateCopo_set_averages);
export default router;
