// utils/navigation.js

const navigationConfig = {
  1: [
    { name: "Dashboard", to: "/", submenus: null },
    { name: "Classroom", to: "/viewclassroom", submenus: null },
    { name: "Course Exit Survey", to: "/student-feedback", submenus: null },
    { name: "Mentee",  submenus: [
      { name: "Mentee Details", to: "/mentee-details" },
      { name: "Mentee Internships", to: "/mentee-internships" },
      { name: "Mentee Certification", to: "/mentee-certification" },
      { name: "Mentee Marksheet", to: "/mentee-marksheet" },
      { name: "Mentee Resume", to: "/mentee-resume" },
      { name: "Forums", to: "/student/forums" },
    ], },
    {
      name:"Profile", to:"student-profile", submenus: null
    }

    // { name: "Dashboard", to: "/", submenus: null },
    // { name: "Dashboard", to: "/", submenus: null },
    // { name: "Dashboard", to: "/", submenus: null },

   
  ],
  2: [
    { name: "Dashboard", to: "/", submenus: null },
    {
      name: "Form",
      to: "/form", // Redirects to /form if clicked
      submenus: [
 
  
        { name: "User Course", to: "/usercourse" },
        { name: "Show Po's", to: "/posform" },
        { name: "MAP COPO", to: "/coposhow" },
      ],
    },
    {
      name: "Assessment",
      to: "/termwork-selector",
      submenus: [
        { name: "Choose Assessment", to: "/termwork-selector" },
        { name: "Upload-Assessment Questions", to: "/upload-questions" },
        { name: "Upload-Assessment", to: "/upload-termwork" },
        { name: "Course Exit Survey", to: "/feedback" },
      ],
    },
    { name: "Result", to: "/result", submenus: null },
    {
      name: "LMS",
      submenus: [
        { name: "LMS DASHBOARD", to: "/lms" },
        { name: "View All Classrooms", to: "/lms/viewclassroom" },
        { name: "Manage Classrooms", to: "/lms/manageclassroom/" },
        { name: "Create Cohorts", to: "/lms/createcohorts" },
        { name: "Manage Cohorts", to: "/lms/managecohorts" },
        { name: "Mark Attendance", to: "/lms/studentLmsAttendance" },
        { name: "Student Attendance", to: "/lms/AllstudentLmsAttendance" },
      ],
    },
    {
      name: "Mentor",
      submenus: [
        { name: "Mentor groups", to: "/mentor-groups" },
        { name: "Mentee Forums", to: "/teacher/forums" },
      ],
    },
    {
      name:"Calendar", to:"/calendar",submenus:null
    }
  ],
  3: [
    { name: "Dashboard", to: "/", submenus: null },
    {name:"Add Course", submenus: [
      { name: "Add Course", to: "/courseform" },
      { name: "User Course Registration", to: "/registerform" },
    { name: "Show UserCourse", to: "/show-usercourse" },
    ]},    
    { name: "Edit POs", to: "/editpos",submenus: null },
    { name: "Reports", to: "/reports",submenus: [
      { name: "Faculty Wise Reports", to: "/facultyreports" },
      { name: "Course Outcome Wise Reports", to: "/courseoutcomereports" },
      { name: "Course Wise Reports", to: "/coursewisereports" },
      { name: "Semester Wise Reports", to: "/semesterwisereports" },
      { name: "Set Target Reports", to: "/set-target-reports" },
    ] },
    { name: "Mentor-Mentee", to: "/reports",submenus: [
      { name: "Assign Mentor", to: "/assign-mentor-mentee" },
    ] },
    { name: "Ai Scheduling", submenus: [
      { name: "Add Instructor", to: "/add-instructor" },
      { name: "View Instructor", to: "/view-instructor" },
      { name: "Add Room", to: "/add-room" },
      { name: "View Room", to: "/view-room" },
      { name: "Add Timing", to: "/add-timing" },
      { name: "View Timing", to: "/view-timing" },
      { name: "Add Course", to: "/add-course" },
      { name: "View Course", to: "/view-course" },
      { name: "Add Department", to: "/add-department" },
      { name: "View Department", to: "/view-department" },
      { name: "Add Section", to: "/add-section" },
      { name: "View Section", to: "/view-section" },
      { name: "Generate timetable", to: "/timetable-generator" },
    ] },
    

    // { name: "Assign Course", to: "/assigncourse",submenus: null },
    // { name: "Next Sem", to:"/nextsem", submenus: null  },
  ],
};

export const getNavigationByUserType = (userType) => {
  return navigationConfig[userType] || [];
};
