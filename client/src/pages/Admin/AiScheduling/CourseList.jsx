import { useEffect, useState } from "react";
import { api2 } from "../../../api";
import { FaTrash, FaBook, FaSearch, FaExclamationCircle, FaSpinner } from "react-icons/fa";
import Pagination from "../../../components/Pagination/Pagination";

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteInProgress, setDeleteInProgress] = useState(null);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const response = await api2.get("/api/courses/");
        setCourses(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError("Failed to load courses. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleDelete = async (courseNumber) => {
    setDeleteInProgress(courseNumber);
    try {
      await api2.delete(`/api/courses/delete/${courseNumber}/`);
      setCourses((prevCourses) => prevCourses.filter((crs) => crs.course_number !== courseNumber));
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Failed to delete course. Please try again.");
    } finally {
      setDeleteInProgress(null);
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.course_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  console.log("paginatedCourses:", paginatedCourses);

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-lg p-6">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <FaBook className="mr-3" /> Course List
        </h1>
        <p className="text-blue-100 mt-2">
          View and manage all available courses
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
            placeholder="Search courses..."
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
            <span className="ml-2 text-gray-600">Loading courses...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center">
            <FaExclamationCircle className="mr-2" />
            {error}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            {searchTerm ? "No courses match your search" : "No courses available"}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course Number
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instructors
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedCourses.map((course) => (
                  <tr key={course.course_number} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                      {course.course_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {course.course_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {course.instructors && course.instructors.length > 0 
                        ? course.instructors.join(', ')
                        : <span className="text-gray-400 italic">No instructors assigned</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleDelete(course.course_number)}
                        disabled={deleteInProgress === course.course_number}
                        className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                        title="Delete course"
                      >
                        {deleteInProgress === course.course_number ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaTrash />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !error && filteredCourses.length > 0 && (
          <div className="mt-6">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>
    </div>
  );
}