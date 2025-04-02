import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../../../api";
import Pagination from "../../../../components/Pagination/Pagination";
import { FaSearch, FaSort, FaChalkboardTeacher, FaUserGraduate, FaSpinner, FaPlus } from "react-icons/fa";

const ManageClassroom = ({ uid }) => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Search Query State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  // Fetch Classrooms from API
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/lmsclassroom/show/${uid}`);
        const classroomData = Array.isArray(response.data) ? response.data : [response.data];
        setClassrooms(classroomData);
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

  // Handle Search Input Change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle Sort Change
  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  // Filter Classrooms Based on Search Query
  const filteredClassrooms = classrooms
    .filter((classroom) => {
      const query = searchQuery.toLowerCase();
      return (
        classroom.branch?.toLowerCase().includes(query) ||
        classroom.room_name?.toLowerCase().includes(query) ||
        classroom.academic_year?.toLowerCase().includes(query) ||
        classroom.semester?.toString().includes(query)
      );
    })
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.created_at) - new Date(a.created_at);
      } else {
        return new Date(a.created_at) - new Date(b.created_at);
      }
    });

  // Pagination Logic
  const totalPages = Math.ceil(filteredClassrooms.length / itemsPerPage);
  const paginatedClassrooms = filteredClassrooms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle Page Change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto mt-5">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <FaChalkboardTeacher className="text-blue-600 text-5xl mr-3" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl text-blue-700 font-bold">
              Manage Classrooms
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            View and manage your virtual classrooms and student enrollments
          </p>
        </div>

        {/* Action Bar */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search Bar */}
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search classrooms..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Sort Dropdown */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSort className="text-gray-400" />
                </div>
                <select
                  value={sortOrder}
                  onChange={handleSortChange}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>

              {/* Create New Classroom Button */}
              <Link
                to="/lms/createclassroom"
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <FaPlus className="mr-2" />
                New Classroom
              </Link>
            </div>
          </div>
        </div>

        {/* Classrooms List */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <FaSpinner className="animate-spin text-blue-600 text-3xl" />
            </div>
          ) : filteredClassrooms.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-20 text-gray-500">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-xl font-medium">No classrooms found</p>
              <p className="mt-2">Try adjusting your search or create a new classroom</p>
              <Link
                to="/lms/createclassroom"
                className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <FaPlus className="mr-2" />
                Create Classroom
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Classroom Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Branch
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Semester
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedClassrooms.map((classroom) =>
                    classroom && classroom.room_name ? (
                      <tr key={classroom.classroom_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{classroom.room_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{classroom.branch || "Unknown Branch"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            Semester {classroom.semester}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(classroom.created_at).toLocaleDateString()} 
                          <span className="text-xs text-gray-400 ml-1">
                            {new Date(classroom.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            to={`/lms/manageclassroom/${classroom.classroom_id}`}
                            className="inline-flex items-center text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            <FaUserGraduate className="mr-1" /> Manage Students
                          </Link>
                        </td>
                      </tr>
                    ) : null
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredClassrooms.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageClassroom;