import express, { Router } from "express";
import { showBranch, shownormalBranch } from "../../controller/Teacher/showBranch.js";
import { verifyToken } from "../../middleware/auth.js";

const router = express.Router();

router.get("/show",verifyToken, showBranch);
router.get("/shownormal",verifyToken, shownormalBranch);
export default router;
