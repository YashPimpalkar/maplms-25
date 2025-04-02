import { useEffect, useState } from "react";
import { api2 } from "../../../api";
import { FaTrash, FaBuilding, FaSearch, FaExclamationCircle, FaSpinner, FaBook } from "react-icons/fa";
import Pagination from "../../../components/Pagination/Pagination";

export default function DepartmentList() {
  const [departments, setDepartments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteInProgress, setDeleteInProgress] = useState(null);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchDepartments = async () => {
      setIsLoading(true);
      try {
        const response = await api2.get("/api/departments/");
        setDepartments(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching departments:", error);
        setError("Failed to load departments. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  const handleDelete = async (deptName) => {
    setDeleteInProgress(deptName);
    try {
      await api2.delete(`/api/departments/delete/${deptName}/`);
      setDepartments((prevDepartments) =>
        prevDepartments.filter((dept) => dept.dept_name !== deptName)
      );
    } catch (error) {
      console.error("Error deleting department:", error);
      alert("Failed to delete department. Please try again.");
    } finally {
      setDeleteInProgress(null);
    }
  };

  const filteredDepartments = departments.filter(
    (dept) => dept.dept_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const paginatedDepartments = filteredDepartments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-lg p-6">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <FaBuilding className="mr-3" /> Department List
        </h1>
        <p className="text-blue-100 mt-2">
          View and manage all academic departments
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-b-lg p-6">
        {/* Search Bar */}
        <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <FaSpinner className="animate-spin text-indigo-600 text-2xl" />
            <span className="ml-2 text-gray-600">Loading departments...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center">
            <FaExclamationCircle className="mr-2" />
            {error}
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            {searchTerm ? "No departments match your search" : "No departments available"}
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedDepartments.map((dept) => (
              <div 
                key={dept.id} 
                className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-indigo-700 flex items-center">
                    <FaBuilding className="mr-2 text-indigo-500" />
                    {dept.dept_name}
                  </h2>
                  <button
                    onClick={() => handleDelete(dept.dept_name)}
                    disabled={deleteInProgress === dept.dept_name}
                    className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                    title="Delete department"
                  >
                    {deleteInProgress === dept.dept_name ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaTrash />
                    )}
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex items-start">
                    <FaBook className="text-gray-400 mt-1 mr-2" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-1">Courses</h3>
                      {dept.courses && dept.courses.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {dept.courses.map((course, index) => (
                            <span 
                              key={index} 
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                            >
                              {typeof course === 'object' ? course.course_name : course}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm italic">No courses assigned</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !error && filteredDepartments.length > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}