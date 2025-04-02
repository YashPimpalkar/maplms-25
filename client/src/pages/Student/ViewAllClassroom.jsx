import React, { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaVideo,
  FaChalkboardTeacher,
  FaCalendarAlt,
  FaUserGraduate,
  FaBook,
  FaGraduationCap,
  FaFilter,
} from "react-icons/fa";
const ViewClassroom = ({ uid }) => {
  const [classrooms, setClassrooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClassrooms, setFilteredClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const navigate = useNavigate();
  const openMeetingModal = () => setIsMeetingModalOpen(true);
  const closeMeetingModal = () => setIsMeetingModalOpen(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetingCode, setMeetingCode] = useState("");

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/studentlms/getclassroom/${uid}`);
        const sortedClassrooms = response.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setClassrooms(sortedClassrooms);
        setFilteredClassrooms(sortedClassrooms);
      } catch (error) {
        console.error("Error fetching classrooms:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClassrooms();
  }, [uid]);
  const handleMeetingJoin = () => {
    if (meetingCode.trim()) {
      const meetingUrl = `https://meet.jit.si/${meetingCode.trim()}`;
      window.open(meetingUrl, "_blank"); // Opens the meeting in a new tab
      setIsMeetingModalOpen(false); // Close the modal after joining
    } else {
      alert("Please enter a valid room code.");
    }
  };
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    filterClassrooms(value, activeFilter);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    filterClassrooms(searchTerm, filter);
  };

  const filterClassrooms = (search, filter) => {
    let filtered = classrooms;

    // Apply search filter
    if (search) {
      filtered = filtered.filter(
        (classroom) =>
          classroom.room_name.toLowerCase().includes(search) ||
          classroom.teacher_name.toLowerCase().includes(search) ||
          classroom.academic_year.toLowerCase().includes(search)
      );
    }

    // Apply category filter
    if (filter !== "all") {
      filtered = filtered.filter((classroom) => {
        if (filter === "current")
          return classroom.academic_year.includes("2023-2024");
        if (filter === "semester") return classroom.semester === "6";
        return true;
      });
    }

    setFilteredClassrooms(filtered);
  };

  const handleViewClassroom = (classroomId) => {
    navigate(`/viewclassroom/${classroomId}`);
  };

  // Function to get a gradient based on subject type
  const getSubjectGradient = (subjectName) => {
    const subject = subjectName.toLowerCase();
    if (subject.includes("data") || subject.includes("algorithm"))
      return "from-blue-500 to-indigo-600";
    if (subject.includes("web") || subject.includes("development"))
      return "from-green-500 to-teal-600";
    if (subject.includes("database") || subject.includes("sql"))
      return "from-purple-500 to-pink-600";
    if (subject.includes("network") || subject.includes("security"))
      return "from-yellow-500 to-orange-600";
    if (subject.includes("ai") || subject.includes("machine"))
      return "from-red-500 to-pink-600";

    // Default gradients for other subjects
    const gradients = [
      "from-blue-500 to-indigo-600",
      "from-green-500 to-teal-600",
      "from-purple-500 to-pink-600",
      "from-yellow-500 to-orange-600",
      "from-red-500 to-pink-600",
      "from-indigo-500 to-purple-600",
    ];

    // Use the first character of the room name to deterministically select a gradient
    const charCode = subjectName.charCodeAt(0) % gradients.length;
    return gradients[charCode];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl mb-10 overflow-hidden">
          <div className="px-6 py-12 sm:px-12 sm:py-16 relative">
            <div className="absolute right-0 top-0 h-full w-1/3 opacity-10">
              <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-full"
              >
                <path
                  d="M95 50C95 74.8528 74.8528 95 50 95C25.1472 95 5 74.8528 5 50C5 25.1472 25.1472 5 50 5C74.8528 5 95 25.1472 95 50Z"
                  stroke="white"
                  strokeWidth="10"
                />
                <path
                  d="M85 50C85 69.33 69.33 85 50 85C30.67 85 15 69.33 15 50C15 30.67 30.67 15 50 15C69.33 15 85 30.67 85 50Z"
                  stroke="white"
                  strokeWidth="10"
                />
                <path
                  d="M75 50C75 63.8071 63.8071 75 50 75C36.1929 75 25 63.8071 25 50C25 36.1929 36.1929 25 50 25C63.8071 25 75 36.1929 75 50Z"
                  stroke="white"
                  strokeWidth="10"
                />
              </svg>
            </div>
            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <FaGraduationCap className="text-white text-3xl mr-3" />
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  My Learning Journey
                </h1>
              </div>
              <p className="text-blue-100 text-lg max-w-2xl mb-8">
                Access all your enrolled courses, assignments, and learning
                materials in one place.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Box */}
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-blue-300" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-4 py-3 border-0 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="Search your classrooms..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>

                {/* Filter Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleFilterChange("all")}
                    className={`px-4 py-2 rounded-lg flex items-center ${
                      activeFilter === "all"
                        ? "bg-white text-blue-600"
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                  >
                    <FaFilter className="mr-2" /> All
                  </button>
                  <button
                    onClick={() => handleFilterChange("current")}
                    className={`px-4 py-2 rounded-lg flex items-center ${
                      activeFilter === "current"
                        ? "bg-white text-blue-600"
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                  >
                    Current Year
                  </button>

                  {/* Change Current Year to Join Meeting */}
                  <button
                    onClick={openMeetingModal}
                    className="px-4 py-2 rounded-lg flex items-center bg-white text-blue-600 hover:bg-blue-100 transition"
                  >
                    <FaVideo className="mr-2" /> Join Meeting
                  </button>
                  {isMeetingModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">
                          Enter Meeting Room Code
                        </h2>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter room code..."
                          value={meetingCode}
                          onChange={(e) => setMeetingCode(e.target.value)}
                        />
                        <div className="flex justify-end mt-4">
                          <button
                            onClick={closeMeetingModal}
                            className="px-4 py-2 bg-gray-400 text-white rounded-lg mr-2 hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleMeetingJoin}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Join
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <FaBook className="text-blue-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {filteredClassrooms.length}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <FaUserGraduate className="text-green-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Semester</p>
                  <p className="text-2xl font-bold text-gray-800">6th</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
                <div className="bg-purple-100 p-3 rounded-full mr-4">
                  <FaCalendarAlt className="text-purple-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Academic Year</p>
                  <p className="text-2xl font-bold text-gray-800">2023-2024</p>
                </div>
              </div>
            </div>

            {/* Empty State */}
            {filteredClassrooms.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl shadow-md">
                <div className="bg-blue-100 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4">
                  <FaChalkboardTeacher className="text-blue-600 text-3xl" />
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  No classrooms found
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {searchTerm
                    ? "Try adjusting your search terms or filters to find what you're looking for."
                    : "You are not enrolled in any classrooms yet."}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setActiveFilter("all");
                      setFilteredClassrooms(classrooms);
                    }}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            {/* Classroom Grid */}
            {filteredClassrooms.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClassrooms.map((classroom) => {
                  const gradient = getSubjectGradient(classroom.room_name);
                  return (
                    <div
                      key={classroom.classroom_id}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    >
                      {/* Card Header with Gradient */}
                      <div
                        className={`bg-gradient-to-r ${gradient} h-24 p-4 flex items-center justify-between`}
                      >
                        <h3 className="text-xl font-bold text-white truncate">
                          {classroom.room_name}
                        </h3>
                        <div className="bg-white bg-opacity-30 rounded-full p-2">
                          <FaChalkboardTeacher className="text-white text-xl" />
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5">
                        <div className="flex items-center mb-3">
                          <FaUserGraduate className="text-gray-500 mr-2" />
                          <p className="text-gray-700 font-medium">
                            {classroom.teacher_name}
                          </p>
                        </div>

                        <div className="flex items-center mb-4">
                          <FaCalendarAlt className="text-gray-500 mr-2" />
                          <p className="text-gray-600 text-sm">
                            {classroom.academic_year}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            Semester {classroom.semester}
                          </span>
                          <button
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
                            onClick={() =>
                              handleViewClassroom(classroom.classroom_id)
                            }
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ViewClassroom;
