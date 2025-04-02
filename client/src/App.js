import logo from './logo.svg';
import './App.css';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from './sections/Header';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StudentLogin from './pages/auth/StudentLogin';
import NotFound from './components/PageNotFound/NotFound';
import TeacherDashboard from './components/Dashboard/Teacherdashboard';
import Cos_reg from "./pages/Teacher/CourseRegistration/Co_reg"
import Pos_reg from "./pages/Teacher/CourseRegistration/Pos_reg"
import StudentProfile from './pages/Student/Profile/StudentProfile'

import User_course from "./pages/Teacher/CourseRegistration/User_course"
import ShowCos from   "./pages/Teacher/CourseRegistration/ShowCos"
import Coposhow from  "./pages/Teacher/CourseRegistration/ShowCopo"
import TermworkSelector from './pages/Teacher/TermWork/TermworkSelector';
import UploadTermworkQuestion from './pages/Teacher/TermWork/UploadTermworkQuestion';
import TermworkUpload from './pages/Teacher/TermWork/TermworkUpload';
import Result from './pages/Teacher/TermWork/Result';

// LMS Classroom
import LMSTeacherDashboard from "./components/Dashboard/LMSTeacherDashboard"
import ViewAllClassroom from './pages/Teacher/LMS/Classroom/ViewAllClassroom';
import ManageClassroom from './pages/Teacher/LMS/Classroom/ManageClassroom';
import ManageClassroomStudents from './pages/Teacher/LMS/Classroom/ManageClassroomStudents';


import CreateCohorts from './pages/Teacher/LMS/Cohorts/CreateCohorts';
import ManageCohorts from './pages/Teacher/LMS/Cohorts/ManageCohorts';
import ManageCohortStudents from './pages/Teacher/LMS/Cohorts/ManageCohortStudents';
import EditCohort from './pages/Teacher/LMS/Cohorts/EditCohort';
import ClassroomActivities from './pages/Teacher/LMS/Classroom/ClassroomActivities';
import AssignmentSubmissions from './pages/Teacher/LMS/Classroom/AssignmentSubmissions';
import StudentLmsAttendance from './pages/Teacher/LMS/Attendance/StudentLmsAttendance';


//Calendar
import Calendar from './components/Calender/Calendar';
// Admin

import UserSelection from "./pages/Admin/UserSelection/UserSelection"
import AssignCourse from "./pages/Admin/UserSelection/AssignCourse"
import EditPOs from "./pages/Admin/EditPOs"
import AdminCOs_course  from "./pages/Teacher/CourseRegistration/EditCOs"
import NextSemButton  from "./pages/Admin/NextSem"
import Course_reg from "./pages/Admin/Course_reg"
import Admin_Cos_Edit  from "./pages/Teacher/CourseRegistration/COsData"
import AdminSideShowCOs  from "./pages/Admin/AdminSideShowCOs"
import AdminSideEditCourse  from "./pages/Admin/AdminSideEditCourse"
import RegistrationForm from "./pages/Admin/RegisterForm"
import CourseWiseReports from './pages/Admin/Reports/CourseReports';
import FacultyWiseReports from  './pages/Admin/Reports/FacultyWiseReports';
import SemesterWiseReports from  './pages/Admin/Reports/SemesterWiseReports';
import SetTargetReports from './pages/Admin/Reports/SetTargetReports';
import VideoCall from "./pages/VideoCall";
//Ai Scheduling
import AddInstructor from './pages/Admin/AiScheduling/AddInstructor';
import InstructorList from './pages/Admin/AiScheduling/InstructorList';
import AddRoom from './pages/Admin/AiScheduling/AddRoom';
import RoomList from './pages/Admin/AiScheduling/RoomList';
import AddMeetingTime from './pages/Admin/AiScheduling/AddMeetingTime ';
import MeetingTimeList from './pages/Admin/AiScheduling/MeetingTimeList';
import AddCourse from './pages/Admin/AiScheduling/AddCourse';
import CourseList from './pages/Admin/AiScheduling/CourseList';
import AddDepartment from './pages/Admin/AiScheduling/AddDepartment';
import DepartmentList from './pages/Admin/AiScheduling/DepartmentList';
import AddSection from './pages/Admin/AiScheduling/AddSection';
import SectionList from './pages/Admin/AiScheduling/SectionList';
import TimetableGenerator from './pages/Admin/AiScheduling/TimetableGenerator';
// Student

import StudentlmsDashboard from './pages/Student/StudentlmsDashboard';
import ViewClassroom from './pages/Student/ViewAllClassroom';
import StudentClassRoomActivities from './pages/Student/StudentClassRoomActivities';
import ActivityDetail from './pages/Student/Activitydetails';
// import StudentSideFeedback from './pages/Student/StudentSideFeedback';
import ViewFeedback from './pages/Student/ViewFeedback';
import Feedback from './pages/Teacher/TermWork/Feedback';
import StudentFeedback from './pages/Student/StudentFeedback';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import AllSubjectWiseAttendance from './pages/Teacher/LMS/Attendance/AllSubjectWiseAttendance';
import CourseOutcomeWiseReports from './pages/Admin/Reports/CourseOutComeWiseReports';
import UserWiseDetails from './pages/Admin/Reports/UserwiseReport';
import CourseresultReports from './pages/Admin/Reports/CourseresultReports';
import ShowUserCourse from './pages/Admin/ShowUsercourse';

// Import Mentor-Mentee Forum
import Mentor_Forums from './pages/Teacher/Chats/Mentor_Forums';
import Mentee_Forums from './pages/Student/Chats/Mentee_Forums';
import MentorChat from './pages/Teacher/Chats/MentorChat';
import MenteeChat from './pages/Student/Chats/MenteeChat';


import Notification from './pages/Teacher/Mentor/Notification/Notification';
import NotificationsStudents from './pages/Student/Mentee/NotificationsStudents';


import AssignMentorMentee from './pages/Admin/Mentor-Mentee/AssignMentorMentee';
import MenteeDetails from './pages/Student/Mentee/MenteeDetails';
import MenteeInternships from './pages/Student/Mentee/MenteeInternships';
import MenteeCertification from './pages/Student/Mentee/MenteeCertification';
import MenteeResume from './pages/Student/Mentee/MenteeResume';
import MentorGroups from './pages/Teacher/Mentor/MentorGroups';
import GroupDetails from './pages/Teacher/Mentor/GroupDetails';
import MenteeAllDetails from './pages/Teacher/Mentor/MenteeAllDetails';
import MenteeMarksheet from './pages/Student/Mentee/MenteeMarksheet';
import Quiz from './pages/Teacher/LMS/Quiz/Quiz';
import ClassRoomQuiz from './pages/Student/ClassRoomQuiz';


function App() {
  const [token, setToken] = useState("");
  const [user_id, setUID] = useState(0);
  const [sid,setSID]=useState(0)
  const [usertype, setUserType] = useState(0);


  useEffect(() => {
    const storedToken = window.localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);

      const uid = window.localStorage.getItem("uid");
      const sid = window.localStorage.getItem("sid");
      const user_type = window.localStorage.getItem("user_type");

      if (user_type) {
        setUserType(parseInt(user_type));
      }
      if (uid) {
        setUID(parseInt(uid));
      }
      if (sid) {
        setSID(parseInt(sid));
      }
    }
  }, []);

  return (
    <main className="overflow-hidden">
      <Header />
      <Routes>
        {token  &&  (user_id || sid)  ? (
          usertype === 1  && sid ? (
            <>
              {/* Define routes for usertype === 1 */}
            
              <Route path="/" element={<StudentlmsDashboard uid={sid} />} />
              <Route path="/viewclassroom" element={<ViewClassroom uid={sid} />} />
              <Route path="/viewclassroom/:classroomId" element={<StudentClassRoomActivities uid={sid} />} />
              <Route path="/viewclassroom/:classroomId/quiz/:sid" element={<ClassRoomQuiz sid={sid} />} />
              <Route path="/lms/activity-detail/:id" element={<ActivityDetail  sid={sid} />} />
              {/* <Route path="/feedback-student" element={<StudentSideFeedback uid={sid} />} /> */}
              <Route path="/student-feedback/:usercourseid" element={<ViewFeedback sid={sid}/>} />
              <Route path="/student-feedback" element={<StudentFeedback sid={sid} />} />
              <Route path="/student-profile" element={<StudentProfile sid={sid} />} />

                
                {/* forums */}
              <Route path="/student/forums" element={<Mentee_Forums sid={sid} />} />
              <Route path="/student/forums/:mmr_id" element={<MenteeChat sid={sid} />} />


              {/* mentee */}
              <Route path="/mentee-details" element={<MenteeDetails sid={sid} />} />
              <Route path="/mentee-internships" element={<MenteeInternships sid={sid} />} />
              <Route path="/mentee-certification" element={<MenteeCertification sid={sid} />} />
              <Route path="/mentee-marksheet" element={<MenteeMarksheet sid={sid} />} />
              <Route path="/mentee-resume" element={<MenteeResume sid={sid} />} />
              <Route path="/notifications" element={<NotificationsStudents sid={sid} />} />

              <Route path="*" element={<NotFound />} />
            </>
          ) : usertype === 2 && user_id ? (
            <>
              {/* Define routes for usertype === 2 */}
              <Route path="/video/:roomName" element={<VideoCall />} />
              <Route path='/' element={<TeacherDashboard />} />
              <Route path="/coform" element={<Cos_reg />} />
              <Route path="/editcos" element={<AdminCOs_course uid={user_id} />}/>
              <Route path="/addremovecos" element={<Admin_Cos_Edit />}/>
              <Route path="/posform" element={<Pos_reg />} />
              <Route path="/courseform" element={<Course_reg />} />
              <Route path='/registerform' element={<RegistrationForm uid={user_id}/>} />
              <Route path='/usercourse' element={<User_course uid={user_id}/>} />
              <Route path='/cos' element={<ShowCos />} />
              <Route path='/coposhow' element={<Coposhow  uid={user_id}/>} />
              <Route path='/termwork-selector' element={<TermworkSelector  uid={user_id}/>} />
              <Route path='/upload-questions' element={<UploadTermworkQuestion  uid={user_id}/>} />
              <Route path='/Upload-Termwork' element={<TermworkUpload  uid={user_id}/>} />
              <Route path='/result' element={<Result  uid={user_id}/>} />
              <Route path='/feedback' element={<Feedback uid={user_id}/>} />

                {/* mentor paths */}
              <Route path='/mentor-groups' element={<MentorGroups uid={user_id}/>} />
              <Route path="/mentor-group-details/:mmr_id" element={<GroupDetails   />} />
              <Route path="/mentor-group-details/:mmr_id/student-details/:sid" element={<MenteeAllDetails   />} />
              <Route path='/mentor-group-details/:mmr_id/create-notification' element={<Notification uid={user_id} />} />
              

              {/* forums */}
              <Route path="/teacher/forums" element={<Mentor_Forums uid={user_id} />} />
              <Route path="/teacher/forums/:mmr_id" element={<MentorChat uid={user_id}/>} />
              
              {/* Calendar */}
              <Route path='/calendar' element={<Calendar uid={user_id}/>} />
              {/* LMS Classroom */}

              
              
              <Route path='/lms' element={<LMSTeacherDashboard  uid={user_id}/>} />
              <Route path='/lms/viewclassroom' element={<ViewAllClassroom uid={user_id}/>} />
              <Route path='/lms/manageclassroom' element={<ManageClassroom uid={user_id}/>} />
              <Route path='/lms/manageclassroom/:classId' element={<ManageClassroomStudents uid={user_id}/>} />

              <Route path='/lms/createcohorts' element={<CreateCohorts uid={user_id}/>} />
              <Route path='/lms/managecohorts' element={<ManageCohorts uid={user_id}/>} />
              <Route path='/lms/managestudents/:cohortId' element={<ManageCohortStudents uid={user_id}/>} />
              <Route path="/lms/editcohort/:cohortId" element={<EditCohort uid={user_id}/>} />

              {/* classroom activities */}
              <Route path= "/lms/viewclassroom/:classroomId" element={<ClassroomActivities uid={user_id}/>} />
              <Route path="/lms/viewclassroom/:classroomId/submissions/:assignmentId" element={<AssignmentSubmissions  uid={user_id}/>} />
              {/* classroom activities */}

              <Route path='/lms/studentLmsAttendance' element={<StudentLmsAttendance uid={user_id}/>} />
              <Route path='/lms/AllstudentLmsAttendance' element={<AllSubjectWiseAttendance  uid={user_id}/>} />
              <Route path='/lms/viewclassroom/:classroomId/quiz' element={<Quiz  uid={user_id}/>} />
              {/* LMS Classroom*/}
          

              <Route path="*" element={<NotFound />} />
            </>
          ) : usertype === 3 && user_id ? (
            <>
              {/* Define routes for usertype === 3 */}
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/courseform" element={<Course_reg />} />
              <Route path='/registerform' element={<RegistrationForm uid={user_id}/>} />
              <Route path="/AssignCourse" element={<AssignCourse />} />
              <Route path="/EditPOs" element={<EditPOs />} />
             
              {/* <Route path="/nextsem" element={<NextSemButton />}/> */}
           
              <Route path="/adminshowcos" element={<AdminSideShowCOs />} />
              <Route path="/AdminEditCourse/:userCourseId" element={<AdminSideEditCourse />} />
              <Route path="/courseoutcomereports" element={<CourseOutcomeWiseReports uid={user_id} />} />
              <Route path="/set-target-reports" element={<SetTargetReports uid={user_id} />} />
              <Route path="/facultyreports" element={<FacultyWiseReports uid={user_id} />} />
              <Route path="/semesterwisereports" element={<SemesterWiseReports uid={user_id}/>} />
              <Route path="/userwisedetails" element={<UserWiseDetails uid={user_id}/>} />
              <Route path="/coursewisereports" element={<CourseWiseReports uid={user_id}/>} />
              <Route path="/courseresultreports" element={<CourseresultReports uid={user_id}/>} />
              <Route path="/show-usercourse" element={<ShowUserCourse uid={user_id}/>} />
              <Route path='/assign-mentor-mentee' element={<AssignMentorMentee uid={user_id} />} />
              {/* Ai scheduling */}
              <Route path='/add-instructor' element={<AddInstructor uid={user_id} />} />
              <Route path='/view-instructor' element={<InstructorList uid={user_id} />} />
              <Route path='/add-room' element={<AddRoom uid={user_id} />} />
              <Route path='/view-room' element={<RoomList uid={user_id} />} />
              <Route path='/add-timing' element={<AddMeetingTime uid={user_id} />} />
              <Route path='/view-timing' element={<MeetingTimeList uid={user_id} />} />
              <Route path='/add-course' element={<AddCourse uid={user_id} />} />
              <Route path='/view-course' element={<CourseList uid={user_id} />} />
              <Route path='/add-department' element={<AddDepartment uid={user_id} />} />
              <Route path='/view-department' element={<DepartmentList uid={user_id} />} />
              <Route path='/add-section' element={<AddSection uid={user_id} />} />
              <Route path='/view-section' element={<SectionList uid={user_id} />} />
              <Route path='/timetable-generator' element={<TimetableGenerator uid={user_id} />} />
              <Route path="*" element={<NotFound />} />

            </>
          ) : (
            <>
              {/* Fallback for invalid user types */}
              <Route path="/teacher" element={<Login />} />
              {/* <Route path="/register" element={<Register />} /> */}
              <Route path="/" element={<StudentLogin />} />
          
            </>
          )
        ) : (
          <>
            {/* Public routes */}
            <Route path="/teacher" element={<Login />} />
            {/* <Route path="/teacher/register" element={<Register />} /> */}
            <Route path="/" element={<StudentLogin />} />
        
          </>
        )}
      </Routes>
    </main>
  );
}

export default App;
