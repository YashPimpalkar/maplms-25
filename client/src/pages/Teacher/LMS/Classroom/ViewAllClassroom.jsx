import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaSearch, FaPlus, FaChalkboardTeacher, FaVideo } from "react-icons/fa";
import api from "../../../../api";
import "tailwindcss/tailwind.css";

const ViewAllClassroom = ({ uid }) => {
  const [classrooms, setClassrooms] = useState([]);
  const [filteredClassrooms, setFilteredClassrooms] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClassroom = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/lmsclassroom/show/${uid}`);
        const classroomData = Array.isArray(response.data) ? response.data : [response.data];
        setClassrooms(classroomData);
        setFilteredClassrooms(classroomData); // Initialize filtered list
      } catch (error) {
        console.error("Error fetching classroom:", error);
      } finally {
        setLoading(false);
      }
    };

    if (uid) {
      fetchClassroom();
    }
  }, [uid]);

  // Filter classrooms based on search query
   // Function to Start a Meeting in a new tab
   const startMeeting = async () => {
    try {
      const response = await api.get("/api/start-meeting"); // Ensure API URL is correct
      const meetingUrl = response.data.url;

      // Open the meeting in a new tab
      const meetingWindow = window.open(meetingUrl, "_blank");

      if (!meetingWindow) {
        alert("Popup blocked! Please allow popups for this site.");
        return;
      }

      // Check when the meeting window is closed
      const checkMeetingClosed = setInterval(() => {
        if (meetingWindow.closed) {
          clearInterval(checkMeetingClosed);
          window.location.reload(); // Reload the current page when the meeting ends
        }
      }, 1000);
    } catch (error) {
      console.error("Error starting meeting:", error);
      alert("Failed to start meeting. Try again.");
    }
  };
  useEffect(() => {
    const filtered = classrooms.filter(
      (classroom) =>
        classroom.room_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        classroom.academic_year.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredClassrooms(filtered);
  }, [searchQuery, classrooms]);


  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-12 px-6 mb-8 mt-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex w-full justify-center items-center flex-col">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Your Classrooms</h1>
              <p className="text-blue-100 text-lg max-w-2xl">
                Manage your virtual classrooms, assignments, and student interactions all in one place.
              </p>
            </div>
            {/* Start Meeting Button */}
          <button
            onClick={startMeeting}
            className="bg-white text-blue-700 hover:bg-blue-100 transition-all duration-300 px-4 py-2 rounded-lg flex items-center space-x-2 shadow-md"
          >
            <FaVideo />
            <span>Start Meeting</span>
          </button>
          </div>
        </div>
      </div>


      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-md mb-8 p-4 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center mb-4 sm:mb-0">
            <FaChalkboardTeacher className="text-blue-600 text-2xl mr-3" />
            <h2 className="text-xl font-semibold text-gray-800">
              {filteredClassrooms.length} {filteredClassrooms.length === 1 ? 'Classroom' : 'Classrooms'}
            </h2>
          </div>
          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search classrooms..."
              className="border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Classroom Cards */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClassrooms.length > 0 ? (
              filteredClassrooms.map((classroom) => (
                <div
                  key={classroom.classroom_id}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                >
                  {/* Top section with gradient and course details */}
                  <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                    <div className="absolute inset-0 opacity-20">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-white">
                        <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" />
                        <path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z" />
                        <path d="M4.462 19.462c.42-.419.753-.89 1-1.394.453.213.902.434 1.347.661a6.743 6.743 0 01-1.286 1.794.75.75 0 11-1.06-1.06z" />
                      </svg>
                    </div>
                    <div className="p-6 relative z-10">
                      <h3 className="text-white text-xl font-bold mb-1">{classroom.room_name}</h3>
                      <p className="text-blue-100 text-sm">Semester: {classroom.semester}</p>
                      <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center text-xl font-bold border-2 border-white/50">
                        {classroom.room_name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* Middle section with details */}
                  <div className="p-6">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-medium">{classroom.teacher_name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-gray-700 font-medium">{classroom.teacher_name}</p>
                        <p className="text-gray-500 text-sm">Instructor</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-600 text-sm">{classroom.academic_year}</span>
                      </div>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="text-gray-600 text-sm">{classroom.branch}</span>
                      </div>
                    </div>

                    <Link
                      to={`/lms/viewclassroom/${classroom.classroom_id}`}
                      className="block w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 text-center font-medium"
                    >
                      View Classroom
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 bg-white p-8 rounded-xl shadow text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p className="text-gray-600 text-lg mb-2">No classrooms found</p>
                <p className="text-gray-500">
                  {searchQuery ? 'Try a different search term or' : 'Get started by'} creating a new classroom
                </p>
                <Link
                  to="/lms/createclassroom"
                  className="mt-4 inline-block bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200"
                >
                  <FaPlus className="inline mr-2" /> Create Classroom
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAllClassroom;