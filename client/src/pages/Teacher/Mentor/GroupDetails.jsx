import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../../../api";
import Pagination from "../../../components/Pagination/Pagination";
import { FaSearch, FaUserGraduate, FaEye, FaSpinner, FaArrowLeft, FaUsers, FaBell, FaPlus } from "react-icons/fa";

const GroupDetails = () => {
  const { mmr_id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const mentorGroup = location.state?.mentorGroup;

  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const studentsPerPage = 5;

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/mentor/get-students/${mmr_id}`);
        setStudents(response.data);
        setFilteredStudents(response.data);
      } catch (error) {
        console.error("Error fetching students:", error);
        setError("Failed to fetch students.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [mmr_id]);

  useEffect(() => {
    const filtered = students.filter(
      (student) =>
        student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.stud_clg_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.academic_year.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
    setCurrentPage(1);
  }, [searchTerm, students]);

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  const handleViewStudent = (sid) => {
    navigate(`/mentor-group-details/${mmr_id}/student-details/${sid}`);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleCreateNotification = () => {
    navigate(`/mentor-group-details/${mmr_id}/create-notification`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Notification Container */}
      

        {/* Back Button */}
        <button
          onClick={handleGoBack}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors duration-200"
        >
          <FaArrowLeft className="mr-2" /> Back to Mentor Groups
        </button>
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <FaUsers className="text-blue-600 text-5xl mr-3" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl text-blue-700 font-bold">
              {mentorGroup ? mentorGroup.grp_name : "Group Details"}
            </h1>
          </div>
          
          {mentorGroup && (
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <div className="bg-blue-50 px-4 py-2 rounded-full text-blue-700 font-medium">
                Semester {mentorGroup.semester}
              </div>
              <div className="bg-green-50 px-4 py-2 rounded-full text-green-700 font-medium">
                Year {mentorGroup.year}
              </div>
              <div className="bg-purple-50 px-4 py-2 rounded-full text-purple-700 font-medium">
                {mentorGroup.academic_year}
              </div>
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6 flex justify-between items-center">
          <div className="flex items-center">
            <FaBell className="text-yellow-500 text-2xl mr-3" />
            <h2 className="text-lg font-semibold text-yellow-700">Notifications</h2>
          </div>
          <button
            onClick={handleCreateNotification}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
          >
            <FaPlus className="mr-2" />
            Create Notification
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by Name, College ID, or Academic Year..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <FaSpinner className="animate-spin text-blue-600 text-3xl" />
            </div>
          ) : error ? (
            <div className="text-center p-8 text-red-500">
              <p>{error}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        College ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Semester
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Academic Year
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentStudents.map((student) => (
                      <tr key={student.sid} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">{student.student_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{student.stud_clg_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{student.sid}</td>
                        <td className="px-6 py-4 whitespace-nowrap">Semester {student.semester}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{student.academic_year}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button onClick={() => handleViewStudent(student.sid)} className="text-blue-600 hover:underline">
                            <FaEye className="inline-block mr-1" /> View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDetails;
