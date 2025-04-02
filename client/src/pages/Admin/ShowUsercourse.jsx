import { useState, useEffect } from "react";
import api from "../../api";
import Pagination from "../../components/Pagination/Pagination";
import { FaSearch, FaFilter, FaCalendarAlt, FaBook, FaChalkboardTeacher, FaGraduationCap, FaSpinner, FaInfoCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const ShowUserCourse = ({ uid }) => {
  const [academicYear, setAcademicYear] = useState("");
  const [listAcademicYear, setListAcademicYear] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const coursesPerPage = 10;

  // Filters
  const [searchCourse, setSearchCourse] = useState("");
  const [searchSemester, setSearchSemester] = useState("");
  const [searchTeacher, setSearchTeacher] = useState("");

  // Fetch Academic Years on Component Mount
  useEffect(() => {
    fetchAcademicYears();
  }, []);

  // Fetch Courses When Academic Year Changes
  useEffect(() => {
    if (academicYear) {
      fetchCourses();
    }
  }, [academicYear]);

  // Apply Filters Whenever Filters Change
  useEffect(() => {
    filterCourses();
  }, [courses, searchCourse, searchSemester, searchTeacher]);

  // Fetch List of Available Academic Years
  const fetchAcademicYears = async () => {
    try {
      const response = await api.get(`api/usercourse/admin/academicyear`);
      const years = response.data.map((item) => item.academic_year);
      setListAcademicYear(years);
      if (years.length > 0) setAcademicYear(years[0]);
    } catch (error) {
      console.error("Error fetching academic years:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.post(
        `api/usercourse/admin/show-usercourse/${uid}`,
        { academic_year: academicYear }
      );
      setCourses(Array.isArray(response.data) ? response.data : []);
      setCurrentPage(1); // Reset to first page when changing academic year
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]); // Set to empty array to prevent errors
    } finally {
      setLoading(false);
    }
  };

  // Filter Courses Based on User Input
  const filterCourses = () => {
    let filtered = courses;

    if (searchCourse) {
      filtered = filtered.filter((course) =>
        course.course_name.toLowerCase().includes(searchCourse.toLowerCase())
      );
    }

    if (searchSemester) {
      filtered = filtered.filter(
        (course) => course.semester.toString() === searchSemester
      );
    }

    if (searchTeacher) {
      filtered = filtered.filter((course) =>
        (course.teacher_names || "")
          .toLowerCase()
          .includes(searchTeacher.toLowerCase())
      );
    }

    setFilteredCourses(filtered);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchCourse("");
    setSearchSemester("");
    setSearchTeacher("");
  };

  // **Calculate Pagination**
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * coursesPerPage,
    currentPage * coursesPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div 
        className="max-w-6xl mx-auto"
      >
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mt-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <FaBook className="text-white text-3xl mr-4" />
                <h1 className="text-2xl font-bold text-white">
                  Course Assignments
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300" />
                  <select
                    className="pl-10 pr-4 py-2 bg-white bg-opacity-20 text-white rounded-lg border border-blue-400 focus:outline-none focus:ring-2 focus:ring-white appearance-none"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                  >
                    {listAcademicYear.length > 0 ? (
                      listAcademicYear.map((year, index) => (
                        <option key={index} value={year} className="text-gray-800">
                          {year}
                        </option>
                      ))
                    ) : (
                      <option value="" className="text-gray-800">No academic years available</option>
                    )}
                  </select>
                </div>
                
                <button 
                  onClick={() => setFiltersVisible(!filtersVisible)}
                  className="flex items-center space-x-2 bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors"
                >
                  <FaFilter />
                  <span>{filtersVisible ? "Hide Filters" : "Show Filters"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <AnimatePresence>
            {filtersVisible && (
              <div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Course Name Filter */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FaBook className="mr-2 text-blue-500" />
                        Course Name
                      </label>
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          className="pl-10 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                          placeholder="Search courses..."
                          value={searchCourse}
                          onChange={(e) => setSearchCourse(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Semester Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FaGraduationCap className="mr-2 text-blue-500" />
                        Semester
                      </label>
                      <select
                        className="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        value={searchSemester}
                        onChange={(e) => setSearchSemester(e.target.value)}
                      >
                        <option value="">All Semesters</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <option key={sem} value={sem}>
                            Semester {sem}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Teacher Name Filter */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FaChalkboardTeacher className="mr-2 text-blue-500" />
                        Teacher Name
                      </label>
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          className="pl-10 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                          placeholder="Search teachers..."
                          value={searchTeacher}
                          onChange={(e) => setSearchTeacher(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Display Branch if there are courses */}
          {paginatedCourses.length > 0 && (
            <div className="px-6 py-3 bg-blue-50 border-b border-blue-100">
              <div className="flex items-center">
                <FaInfoCircle className="text-blue-500 mr-2" />
                <span className="font-medium text-blue-800">
                  Branch: {paginatedCourses[0].branchname}
                </span>
              </div>
            </div>
          )}

          {/* Course Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <FaSpinner className="animate-spin text-blue-500 text-4xl" />
              </div>
            ) : filteredCourses.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left tracking-wider font-medium">Course Name</th>
                    <th className="px-6 py-3 text-center tracking-wider font-medium">Semester</th>
                    <th className="px-6 py-3 text-center tracking-wider font-medium">Academic Year</th>
                    <th className="px-6 py-3 text-left tracking-wider font-medium">Teachers</th>
                    <th className="px-6 py-3 text-center tracking-wider font-medium">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paginatedCourses.map((course, index) => (
                    <tr
                      key={course.usercourse_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <FaBook className="text-blue-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{course.course_name}</div>
                            {/* <div className="text-sm text-gray-500">{course.course_code || "No code"}</div> */}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Sem {course.semester}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                        {course.academic_year}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {course.teacher_names ? (
                            course.teacher_names.split(',').map((teacher, idx) => (
                              <div key={idx} className="flex items-center mb-1 last:mb-0">
                                <FaChalkboardTeacher className="text-gray-400 mr-2" />
                                <span>{teacher.trim()}</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-500 italic">No teachers assigned</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                        {new Date(course.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <FaInfoCircle className="text-gray-400 text-5xl mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-500 max-w-md">
                  {courses.length === 0 
                    ? "No courses are available for the selected academic year."                     : "Try adjusting your filters to find what you're looking for."}
                    </p>
                    <button
                      onClick={clearFilters}
                      className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
    
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-white border-t border-gray-200">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                  <div className="mt-2 text-sm text-gray-500 text-center">
                    Showing {(currentPage - 1) * coursesPerPage + 1} to{" "}
                    {Math.min(currentPage * coursesPerPage, filteredCourses.length)} of{" "}
                    {filteredCourses.length} results
                  </div>
                </div>
              )}
            </div>
    
            {/* Stats Cards */}
            {!loading && filteredCourses.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                        <FaBook className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Courses
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              {filteredCourses.length}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                        <FaGraduationCap className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Unique Semesters
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              {new Set(filteredCourses.map(course => course.semester)).size}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                        <FaChalkboardTeacher className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Unique Teachers
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              {new Set(
                                filteredCourses
                                  .flatMap(course => 
                                    course.teacher_names 
                                      ? course.teacher_names.split(',').map(t => t.trim()) 
                                      : []
                                  )
                              ).size}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    };
    
    export default ShowUserCourse;