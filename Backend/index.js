
import express from "express";
const app = express()
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";
// Auth
import loginRoute from "./routes/Auth/Login.js"
import registerRoute from "./routes/Auth/Register.js"
import NotificationRoute from "./routes/Teacher/Mentor/Notification.js"
// Teacher
import UserCourseRoute from "./routes/Teacher/UserCourse.js"
import cosRoute from "./routes/Teacher/cos.js"
import posRoute from "./routes/Teacher/Pos.js"
import copoRoute from "./routes/Teacher/coposhow.js"
import BranchRoute from "./routes/Teacher/showBranch.js"
import TermworkRoute from "./routes/Teacher/Termwork.js"
import AttainmentRoute from "./routes/Teacher/Attainment.js"
import ResultRoute from "./routes/Teacher/Result.js"
import AddCourseRoute from "./routes/Teacher/AddCourse.js"
import FeedbackRoute from "./routes/Teacher/Feedback.js"
import calendarRoutes from "./routes/Teacher/calendar.js";
import MentorRoute from "./routes/Teacher/Mentor/Mentor.js"
// LMSCLASSROOM
import meetingRoutes from "./routes/Teacher.js";
import LMSClassRoom from "./routes/Teacher/LMS/Classroom.js"
import CohortRoute from "./routes/Teacher/LMS/Cohort.js"
import ClassActivitiesRoute from "./routes/Teacher/LMS/ClassroomActivities.js"
import LMSAttendanceRoute from "./routes/Teacher/LMS/Attendance.js"

import NextSemRoute from "./routes/Admin/nextsem.js"


// Student
import studentRoutes from "./routes/Student/studentRoutes.js";
import StudentLmsRoute from "./routes/Student/Studentlms.js"
import StudentFeedbackRoute from "./routes/Student/Feedback.js"
import studentAttendanceRoutes from "./routes/Student/Attendance.js";

import MenteeRoute from "./routes/Student/mentee.js"
//forum
import ForumRoute from "./routes/Teacher/forum.js"

// admin
import UsersRoute from "./routes/Admin/Users.js"
import ReportsRoute from "./routes/Admin/Reports.js"
import AdminUserCourseRoute from "./routes/Admin/UserCourse.js"
import RouteMentorMentee from "./routes/Admin/MentorMentee.js"
const port = 8081;

app.use(cors())
app.use(express.json());
app.use(bodyParser.json());

app.use(cookieParser())
app.use("/api/register",registerRoute)
app.use("/api/login/",loginRoute)
app.use("/api/course",AddCourseRoute)
app.use("/api/usercourse",UserCourseRoute)
app.use("/api/cos",cosRoute)
app.use("/api/pos",posRoute)
app.use("/api/copo",copoRoute)
app.use("/api/branch",BranchRoute);
app.use("/api/termwork",TermworkRoute)
app.use("/api/attainment",AttainmentRoute)
app.use("/api/result",ResultRoute);
app.use("/api/feedback",FeedbackRoute);

//student profile
app.use("/api/student", studentRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/student/attendance", studentAttendanceRoutes);

// lmsClassroom
app.use("/api", meetingRoutes);
app.use("/api/lmsclassroom",LMSClassRoom);
app.use("/api/cohorts",CohortRoute);
app.use("/api/notifications/",NotificationRoute)


app.use("/api/lmsclassroom/activities",ClassActivitiesRoute)

app.use("/api/lmsclassroom/attendance",LMSAttendanceRoute)
// app.use("/api/lmsclassroom/feedback", FeedbackClassroomRoute);


app.use("/api/lmsstudents/", NextSemRoute);
// calendar
app.use("/api/calendar", calendarRoutes);

app.use("/api/studentlms/",StudentLmsRoute)
app.use("/api/studentfeedback/",StudentFeedbackRoute)
app.use("/api/mentor/",MentorRoute)
app.use('/api/forum',ForumRoute)
app.use("/api/notifications/",NotificationRoute)

app.use("/api/notifications/",NotificationRoute)
// student
app.use("/api/mentee",MenteeRoute);
// admin
app.use("/api/users",UsersRoute);
app.use("/api/reports",ReportsRoute)
app.use("/api/usercourse/admin",AdminUserCourseRoute);
app.use("/api/mentormentee",RouteMentorMentee);
app.listen(port, () => {
  console.log("Server is Running on PORT :", port);
});