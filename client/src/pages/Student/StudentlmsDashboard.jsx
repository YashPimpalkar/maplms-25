import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import {
  FaBook,
  FaCalendarAlt,
  FaBell,
  FaChalkboardTeacher,
  FaSearch,
  FaGraduationCap,
  FaLightbulb,
  FaUserGraduate,
  FaChartLine,
} from "react-icons/fa";

const StudentlmsDashboard = ({ uid }) => {
  const [classrooms, setClassrooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClassrooms, setFilteredClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const sid = uid
        if (!sid) return;
        
        const response = await api.get(`/api/student/attendance/overall/${sid}`);
        console.log(response.data)
        if (response.data) {
          setAttendanceData(response.data);
        }
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };
  
    fetchAttendanceData();
  }, []);
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/studentlms/getclassroom/${uid}`);
        console.log(response.data)
        const data = Array.isArray(response.data)
          ? response.data
          : [response.data];
        setClassrooms(data);
        setFilteredClassrooms(data);
      } catch (error) {
        console.error("Error fetching classrooms:", error);
      } finally {
        setLoading(false);
      }
    };

    if (uid) {
      fetchClassrooms();
    }
  }, [uid]);
  const handleViewAllNotifications = () => {
    navigate('/notifications');
  };
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setNotificationsLoading(true);
        const sid = window.localStorage.getItem("sid");
        if (!sid) return;
        
        const response = await api.get(`/api/mentee/notifications/${sid}`);
        if (response.data && Array.isArray(response.data)) {
          // Sort notifications by date (newest first)
          const sortedNotifications = response.data.sort((a, b) => 
            new Date(b.created_at || b.event_date) - new Date(a.created_at || a.event_date)
          );
          setNotifications(sortedNotifications);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchNotifications();
  }, []);
  const getTimeElapsed = (dateString) => {
    const notificationDate = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  };


  // useEffect(() => {
  //   // This would fetch the actual attendance data for the student
  //   // For now using placeholder data
  //   setAttendanceData({
  //     overall: 85,
  //     subjects: [
  //       { name: "Data Structures", percentage: 90 },
  //       { name: "Database Management", percentage: 85 },
  //       { name: "Web Development", percentage: 75 },
  //     ],
  //   });
  // }, [uid]);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = classrooms.filter(
      (classroom) =>
        classroom.room_name?.toLowerCase().includes(value) ||
        classroom.teacher_name?.toLowerCase().includes(value) ||
        classroom.academic_year?.toLowerCase().includes(value)
    );

    setFilteredClassrooms(filtered);
  };

  const handleViewClassroom = (classroomId) => {
    navigate(`/viewclassroom/${classroomId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                Welcome to Your Learning Hub
              </h1>
              <p className="text-blue-100 text-lg max-w-2xl">
                Access your courses, track your progress, and stay updated with
                the latest educational resources.
              </p>
            </div>
            <div className="mt-6 md:mt-0">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex items-center">
                <FaUserGraduate className="text-3xl mr-3" />
                <div>
                  <p className="text-sm opacity-80">Current Semester</p>
                  <p className="text-xl font-bold">Semester 6</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FaBook className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Enrolled Courses</p>
                <p className="text-2xl font-bold text-gray-800">
                  {classrooms.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <FaCalendarAlt className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Attendance</p>
                <p className="text-2xl font-bold text-gray-800">
        {attendanceData ? `${attendanceData.overall}%` : "Loading..."}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-yellow-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full mr-4">
                <FaChartLine className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Assignments</p>
                <p className="text-2xl font-bold text-gray-800">12</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-purple-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <FaBell className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Notifications</p>
                <p className="text-2xl font-bold text-gray-800">{notifications.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8 relative">
          <div className="flex items-center bg-white rounded-lg shadow-md overflow-hidden">
            <div className="pl-4">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for courses, teachers, or academic year..."
              className="w-full py-3 px-4 outline-none text-gray-700"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Courses */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <FaBook className="mr-2" /> Your Courses
                </h2>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : filteredClassrooms.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredClassrooms.slice(0, 4).map((classroom) => (
                      <div
                        key={classroom.classroom_id}
                        className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-blue-300"
                        onClick={() =>
                          handleViewClassroom(classroom.classroom_id)
                        }
                      >
                        <div className="flex items-start">
                          <div className="bg-blue-100 p-3 rounded-full mr-3">
                            <FaChalkboardTeacher className="text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 mb-1 truncate">
                              {classroom.room_name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {classroom.teacher_name}
                            </p>
                            <div className="flex justify-between items-center">
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                {classroom.academic_year}
                              </span>
                              <span className="text-xs text-gray-500">
                                Semester {classroom.semester}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaChalkboardTeacher className="mx-auto text-4xl text-gray-300 mb-2" />
                    <p className="text-gray-500">No courses found</p>
                  </div>
                )}

                {filteredClassrooms.length > 4 && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => navigate("/viewclassroom")}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View All Courses
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* College Vision and Mission */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <FaGraduationCap className="mr-2" /> College Values
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Vision Section */}
                  <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-3">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <FaLightbulb className="text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Our Vision
                      </h3>
                    </div>
                    <p className="text-gray-700 text-sm">
                      To provide an environment to educate, encourage, and
                      explore students by facilitating innovative research,
                      entrepreneurship, opportunities, and employability to
                      achieve social and professional goals.
                    </p>
                  </div>

                  {/* Mission Section */}
                  <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-3">
                      <div className="bg-indigo-100 p-2 rounded-full mr-3">
                        <FaGraduationCap className="text-indigo-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Our Mission
                      </h3>
                    </div>
                    <ul className="text-gray-700 text-sm space-y-2">
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 mt-1.5 mr-2"></span>
                        Foster entrepreneurship & strengthen industry-institute
                        interaction
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 mt-1.5 mr-2"></span>
                        Encourage collaborations with industries and academic
                        institutes
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 mt-1.5 mr-2"></span>
                        Promote holistic development through various activities
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        
          {     /* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Attendance Summary */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FaCalendarAlt className="mr-2 text-blue-600" /> Attendance Summary
              </h2>
              {attendanceData ? (
                <div>
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Overall Attendance</span>
                      <span className="text-sm font-medium text-gray-700">{attendanceData.overall}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          attendanceData.overall >= 75 ? 'bg-green-600' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${attendanceData.overall}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {attendanceData.subjects.slice(0, 3).map((subject, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-medium text-gray-500">{subject.name}</span>
                          <span className="text-xs font-medium text-gray-500">{subject.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${
                              subject.percentage >= 75 ? 'bg-green-500' : 'bg-yellow-400'
                            }`}
                            style={{ width: `${subject.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                    {attendanceData.subjects.length > 3 && (
                      <div className="text-right">
                        {/* <span className="text-xs text-blue-600 cursor-pointer hover:underline">
                          +{attendanceData.subjects.length - 3} more subjects
                        </span> */}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Loading attendance data...</p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FaBell className="mr-2 text-blue-600" /> Recent Notifications
            </h2>
            
            {notificationsLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.slice(0, 3).map((notification, index) => {
                  // Determine border color based on notification type or status
                  const borderColor = notification.status === 0 ? 'border-blue-500' : 'border-gray-300';
                  // Truncate long messages
                  const truncatedMessage = notification.message && notification.message.length > 60 
                    ? `${notification.message.substring(0, 60)}...` 
                    : notification.message;
                  
                  return (
                    <div 
                      key={notification.nid || index} 
                      className={`border-l-4 ${borderColor} pl-3 py-2 bg-gray-50 rounded-r hover:bg-gray-100 transition-colors duration-200 cursor-pointer`}
                      onClick={() => navigate('/notifications')}
                    >
                      <p className="text-sm font-medium text-gray-800 mb-1">{truncatedMessage}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                            <span className="text-xs text-blue-600 font-bold">
                              {notification.teacher_name ? notification.teacher_name.charAt(0).toUpperCase() : "T"}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{notification.teacher_name || "Teacher"}</p>
                        </div>
                        <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {getTimeElapsed(notification.created_at || notification.event_date)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <FaBell className="mx-auto text-gray-300 text-2xl mb-2" />
                <p className="text-gray-500">No notifications available</p>
              </div>
            )}
            
            <button 
              onClick={handleViewAllNotifications}
              className="w-full mt-4 text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View All Notifications
            </button>
          </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Links</h2>
              <div className="space-y-2">
                <a href="/student-feedback" className="block p-2 hover:bg-blue-50 rounded text-gray-700 hover:text-blue-700 transition-colors">
                  Course Feedback
                </a>
                <a href="/mentee-details" className="block p-2 hover:bg-blue-50 rounded text-gray-700 hover:text-blue-700 transition-colors">
                  Mentee Details
                </a>
              </div>
            </div>
          </div>
          </div>

      </div>
    </div>
  );
};

export default StudentlmsDashboard;