import express from "express";
import { count_total_no_users_courses, get_total_no_users } from "../../../controller/Admin/Dashboard/Dashboard.js"




const router = express.Router();
router.get("/get-total-no-users/:uid", get_total_no_users);
router.get("/get-total-no-users-courses/:uid", count_total_no_users_courses);
// router.post("/get", getNotifications);


export default router;