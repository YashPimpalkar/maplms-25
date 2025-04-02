import express from "express";

import { teacherAuth, verifyToken } from "../../middleware/auth.js";
import { CombineIa, Feedback, Ia1, Ia2, Popso, Semester, storeCoAttainmentResult, storeCoResult, StorePsoAveragesResult, StorePsodata, TermWork } from "../../controller/Teacher/Result.js";


const router = express.Router();

router.get("/ia1/:uid",verifyToken,teacherAuth, Ia1);
router.get("/ia2/:uid",verifyToken,teacherAuth, Ia2);
router.get("/ia-combine/:uid",verifyToken,teacherAuth, CombineIa);
router.get("/semester/:uid",verifyToken,teacherAuth, Semester);
router.get("/termwork/:uid",verifyToken,teacherAuth, TermWork);
router.get("/feedback/:uid",verifyToken,teacherAuth, Feedback);
router.get("/popso/:uid",verifyToken,teacherAuth, Popso);
router.post("/storepso/",StorePsodata )
router.post("/store-pso-averages/",StorePsoAveragesResult)
router.post("/cosattainment",storeCoResult)
router.post("/coattainment",storeCoAttainmentResult)

export default router;
