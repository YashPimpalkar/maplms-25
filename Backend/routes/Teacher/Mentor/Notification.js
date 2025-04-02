import express from "express";

import { createNotification, getNotifications } from "../../../controller/Teacher/Mentor/Notification.js";


const router = express.Router();
router.post("/", createNotification);
router.post("/get", getNotifications);


export default router;