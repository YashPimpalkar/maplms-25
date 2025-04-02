import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../../../api.js";
import Pagination from "../../../../components/Pagination/Pagination.jsx";
import { FaUsers, FaEdit, FaTrash, FaUserGraduate, FaPlus, FaSearch, FaSpinner } from "react-icons/fa";

const ManageCohorts = ({ uid }) => {
  const [cohorts, setCohorts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [cohortsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("cohort_name");
  const [sortDirection, setSortDirection] = useState("asc");
  
  const branchMapping = {
    1: "COMPUTER",
    2: "IT",
    3: "AIDS",
    4: "AIML",
    5: "MECATRONICS",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res1 = await api.get(`/api/branch/show`);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  // Fetch cohorts from API
  useEffect(() => {
    const fetchCohorts = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/cohorts/show/${uid}`);
        setCohorts(response.data);
      } catch (error) {
        console.error("Error fetching cohorts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCohorts();
  }, [uid]);

  // Handle delete cohort
  const handleDelete = async (cohortId, cohortName) => {
    if (window.confirm(`Are you sure you want to delete the cohort "${cohortName}"?`)) {
      try {
        setLoading(true);
        await api.delete(`/api/cohorts/${cohortId}`);
        setCohorts(cohorts.filter((cohort) => cohort.cohort_id !== cohortId));
      } catch (error) {
        console.error("Error deleting cohort:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle search
  const filteredCohorts = cohorts.filter(cohort => 
    (cohort.cohort_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (cohort.bname?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (cohort.classname?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (cohort.academic_year?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedCohorts = [...filteredCohorts].sort((a, b) => {
    const aValue = a[sortField] || "";
    const bValue = b[sortField] || "";
    
    if (sortDirection === "asc") {
      return aValue.toString().localeCompare(bValue.toString());
    } else {
      return bValue.toString().localeCompare(aValue.toString());
    }
  });

  // Calculate total pages
  const totalPages = Math.ceil(sortedCohorts.length / cohortsPerPage);

  // Get current page data
  const indexOfLastCohort = currentPage * cohortsPerPage;
  const indexOfFirstCohort = indexOfLastCohort - cohortsPerPage;
  const currentCohorts = sortedCohorts.slice(indexOfFirstCohort, indexOfLastCohort);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? "↑" : "↓";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto mt-5">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <FaUsers className="text-blue-600 text-5xl mr-3" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl text-blue-700 font-bold">
              Manage Cohorts
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            View, edit, and manage your student cohorts
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
                placeholder="Search cohorts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Create New Cohort Button */}
            <Link
              to="/lms/createcohort"
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <FaPlus className="mr-2" />
              New Cohort
            </Link>
          </div>
        </div>

        {/* Cohorts Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <FaSpinner className="animate-spin text-blue-600 text-3xl" />
            </div>
          ) : filteredCohorts.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-20 text-gray-500">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-xl font-medium">No cohorts found</p>
              <p className="mt-2">Try adjusting your search or create a new cohort</p>
              <Link
                to="/lms/createcohort"
                className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <FaPlus className="mr-2" />
                Create Cohort
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("cohort_name")}
                    >
                      <div className="flex items-center">
                        Cohort Name {getSortIcon("cohort_name")}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("bname")}
                    >
                      <div className="flex items-center">
                        Branch {getSortIcon("bname")}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("semester")}
                    >
                      <div className="flex items-center">
                        Semester {getSortIcon("semester")}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("classname")}
                    >
                      <div className="flex items-center">
                        Class Name {getSortIcon("classname")}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("academic_year")}
                    >
                      <div className="flex items-center">
                        Academic Year {getSortIcon("academic_year")}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentCohorts.map((cohort) => (
                    <tr key={cohort.cohort_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{cohort.cohort_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{cohort.bname || "Unknown Branch"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Semester {cohort.semester}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cohort.classname}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cohort.academic_year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center justify-center space-x-3">
                          <Link
                            to={`/lms/editcohort/${cohort.cohort_id}`}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                            title="Edit Cohort"
                          >
                            <FaEdit className="w-5 h-5" />
                          </Link>
                          <Link
                            to={`/lms/ManageStudents/${cohort.cohort_id}`}
                            className="text-green-600 hover:text-green-900 transition-colors duration-200"
                            title="Manage Students"
                          >
                            <FaUserGraduate className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(cohort.cohort_id, cohort.cohort_name)}
                            className="text-red-600 hover:text-red-900 transition-colors duration-200"
                            title="Delete Cohort"
                          >
                            <FaTrash className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredCohorts.length > 0 && (
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

export default ManageCohorts;