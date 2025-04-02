import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, CheckCircle, Layers, Calendar, Award, Bell } from 'lucide-react';

const SectionCard = ({ title, links, color, Icon, bgColor }) => {
  const navigate = useNavigate();
  return (
    <div className={`bg-white shadow-lg rounded-2xl p-8 mb-8 transition-all duration-300 hover:shadow-2xl border-t-4 ${color} flex flex-col items-center text-center transform hover:scale-105`}> 
      <div className={`flex items-center justify-center w-16 h-16 rounded-full mb-4 ${bgColor}`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">{title}</h2>
      <ul className="text-gray-700 space-y-3 w-full">
        {links.map((link, index) => (
          <li 
            key={index} 
            className="p-3 rounded-lg cursor-pointer hover:bg-gray-50 font-medium flex items-center justify-center transition-colors duration-200" 
            onClick={() => navigate(link.route)}
          >
            {link.icon && <link.icon className="w-4 h-4 mr-2" />}
            {link.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

const TeacherlmsDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r bg-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
 
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800 leading-tight">
            Welcome to Your <span className="text-indigo-600">Teaching Hub</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Manage your classrooms, cohorts, and student activities all in one place.
          </p>
        </div>
        
        {/* Stats Overview */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Active Classrooms</p>
              <p className="text-2xl font-bold text-gray-800">12</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Students</p>
              <p className="text-2xl font-bold text-gray-800">248</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Attendance Rate</p>
              <p className="text-2xl font-bold text-gray-800">92%</p>
            </div>
          </div>
        </div> */}
        
        {/* Main Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <SectionCard 
            title="Classroom Management" 
            color="border-blue-600"
            bgColor="bg-blue-600"
            Icon={BookOpen}
            links={[
              { text: "View All Classrooms", route: "/lms/viewclassroom", icon: Layers },
              { text: "Manage Classrooms", route: "/lms/manageclassroom", icon: Layers },
              { text: "Classroom Activities", route: "/lms/viewclassroom/:classroomId", icon: Calendar }
            ]}
          />
          
          <SectionCard 
            title="Cohort Management" 
            color="border-purple-600"
            bgColor="bg-purple-600"
            Icon={Users}
            links={[
              { text: "Create Cohorts", route: "/lms/createcohorts", icon: Users },
              { text: "Manage Cohorts", route: "/lms/managecohorts", icon: Users },
              { text: "Manage Cohort Students", route: "/lms/managestudents/:cohortId", icon: Users }
            ]}
          />
          
          <SectionCard 
            title="Student & Attendance" 
            color="border-green-600"
            bgColor="bg-green-600"
            Icon={CheckCircle}
            links={[
              { text: "Student Attendance", route: "/lms/studentLmsAttendance", icon: CheckCircle },
              { text: "All Student Attendance", route: "/lms/AllstudentLmsAttendance", icon: CheckCircle }
            ]}
          />
          
          {/* <SectionCard 
            title="Assignments & Grading" 
            color="border-amber-600"
            bgColor="bg-amber-600"
            Icon={Award}
            links={[
              { text: "Create Assignments", route: "/lms/createassignments", icon: Award },
              { text: "Grade Submissions", route: "/lms/gradesubmissions", icon: Award },
              { text: "Performance Analytics", route: "/lms/performanceanalytics", icon: Award }
            ]}
          />
          
          <SectionCard 
            title="Schedule & Calendar" 
            color="border-rose-600"
            bgColor="bg-rose-600"
            Icon={Calendar}
            links={[
              { text: "View Schedule", route: "/lms/viewschedule", icon: Calendar },
              { text: "Manage Events", route: "/lms/manageevents", icon: Calendar },
              { text: "Set Reminders", route: "/lms/setreminders", icon: Bell }
            ]}
          />
          
          <SectionCard 
            title="Resources & Materials" 
            color="border-teal-600"
            bgColor="bg-teal-600"
            Icon={Layers}
            links={[
              { text: "Upload Materials", route: "/lms/uploadmaterials", icon: Layers },
              { text: "Manage Resources", route: "/lms/manageresources", icon: Layers },
              { text: "Share Content", route: "/lms/sharecontent", icon: Layers }
            ]}
          /> */}
        </div>
      </div>
    </div>
  );
};   

export default TeacherlmsDashboard;