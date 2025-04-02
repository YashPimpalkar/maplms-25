import React, { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import { FaClipboardList, FaChalkboardTeacher, FaCalendarAlt, FaQuestionCircle, FaArrowRight } from "react-icons/fa";

const StudentFeedback = ({ sid }) => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const response = await api.get(`/api/studentfeedback/get_usercourse/${sid}`);
        setClassrooms(response.data);
      } catch (error) {
        setError("Failed to fetch classrooms. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchClassrooms();
  }, [sid]);

  const handleViewClassroomFeedback = (userCourseId) => {
    navigate(`/student-feedback/${userCourseId}`);
  };

  // Function to get a random gradient for classroom cards
  const getRandomGradient = () => {
    const gradients = [
      'from-blue-500 to-indigo-600',
      'from-green-500 to-teal-600',
      'from-purple-500 to-pink-600',
      'from-yellow-500 to-orange-600',
      'from-red-500 to-pink-600',
      'from-indigo-500 to-purple-600'
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 mt-5">
          {/* <div className="inline-block p-3 rounded-full bg-blue-100 text-blue-600 mb-4">
            <FaClipboardList className="text-3xl" />
          </div> */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Course Exit Survey
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Share your valuable feedback to help us improve the learning experience for future students.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-8">
            <div className="flex items-center">
              <div className="py-1">
                <svg className="h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && classrooms.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <FaClipboardList className="mx-auto text-5xl text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No surveys available</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              You don't have any course exit surveys to complete at this time.
            </p>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && !error && classrooms.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {classrooms.map((classroom) => {
              const gradient = getRandomGradient();
              return (
                <div
                  key={classroom.usercourse_id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Card Header with Gradient */}
                  <div className={`bg-gradient-to-r ${gradient} h-24 p-4 flex items-center justify-between`}>
                    <h3 className="text-xl font-bold text-white truncate">
                      {classroom.course_name}
                    </h3>
                    <div className="bg-white bg-opacity-30 rounded-full p-2">
                      <FaChalkboardTeacher className="text-white text-xl" />
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-5">
                    <div className="space-y-3 mb-5">
                      <div className="flex items-center">
                        <FaCalendarAlt className="text-gray-500 mr-2" />
                        <div>
                          <p className="text-sm text-gray-500">Academic Year</p>
                          <p className="text-gray-700 font-medium">{classroom.academic_year}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <FaChalkboardTeacher className="text-gray-500 mr-2" />
                        <div>
                          <p className="text-sm text-gray-500">Semester</p>
                          <p className="text-gray-700 font-medium">{classroom.semester}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <FaQuestionCircle className="text-gray-500 mr-2" />
                        <div>
                          <p className="text-sm text-gray-500">Questions</p>
                          <p className="text-gray-700 font-medium">{classroom.total_questions} questions</p>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleViewClassroomFeedback(classroom.usercourse_id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      Start Survey <FaArrowRight className="ml-2" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentFeedback;