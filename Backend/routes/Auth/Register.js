import express, { Router } from "express";
import { deleteUser, getemail, getstudentemail, getusers, register, setusertype } from "../../controller/Auth/Register.js";
const router = express.Router();


router.post("/", register);
router.post("/getemail/:id", getemail);
router.post("/getusers", getusers);
router.post("/updateusertype", setusertype);
router.delete("/deleteuser/:userid", deleteUser);
router.get("/student/getemail/:id", getstudentemail);
export default router;
