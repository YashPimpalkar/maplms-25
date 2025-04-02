import express from "express";
import { getNotificationsBySid } from "../../controller/Student/mentee.js";

const router = express.Router();


router.get("/notifications/:sid", getNotificationsBySid);


export default router;
