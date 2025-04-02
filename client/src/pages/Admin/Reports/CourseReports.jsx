import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api";
import {
  FaBook,
  FaCalendarAlt,
  FaSearch,
  FaSpinner,
  FaChevronRight,
  FaUniversity,
  FaLayerGroup,
} from "react-icons/fa";
import { motion } from "framer-motion";

const CourseWiseReports = ({ uid }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [userdata, setUserData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("all");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/users/getacademicyear/${uid}`);
        setData(res.data);
        if (res.data.length > 0) {
          setSelectedYear(res.data[0].academic_year);
        }
      } catch (err) {
        console.error("Error fetching academic years:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uid]);

  useEffect(() => {
    if (!selectedYear) return;

    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/reports/getusercoursebybranch/${uid}`, {
          params: { selectedYear },
        });
        setUserData(res.data);
      } catch (err) {
        console.error("Error fetching course data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [selectedYear, uid]);

  // Group data by semester and sort courses by coursecode
  const groupedData = userdata.reduce((acc, course) => {
    if (!acc[course.semester]) {
      acc[course.semester] = [];
    }
    acc[course.semester].push(course);
    return acc;
  }, {});

  // Sort semesters numerically
  const sortedSemesters = Object.keys(groupedData).sort(
    (a, b) => parseInt(a) - parseInt(b)
  );

  // Sort courses within each semester
  sortedSemesters.forEach((semester) => {
    groupedData[semester].sort((a, b) =>
      a.coursecode.localeCompare(b.coursecode)
    );
  });

  // Filter courses based on search term
  const filteredGroupedData = {};
  sortedSemesters.forEach((semester) => {
    if (selectedSemester === "all" || selectedSemester === semester) {
      filteredGroupedData[semester] = groupedData[semester].filter(
        (course) =>
          course.coursecode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (course.teacher_name &&
            course.teacher_name
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }
  });

  const handleCourseClick = (course) => {
    navigate("/courseresultreports", {
      state: {
        usercourseid: course.usercourse_id,
        coursecode: course.coursecode,
        coursename: course.course_name,
        academicYear: selectedYear,
        semester: course.semester,
        teacher_name: course.teacher_name,
      },
    });
  };

  // Calculate summary statistics
  const calculateStats = () => {
    let totalCourses = 0;
    let totalTeachers = new Set();

    Object.values(groupedData).forEach((courses) => {
      totalCourses += courses.length;
      courses.forEach((course) => {
        if (course.teacher_name) {
          totalTeachers.add(course.teacher_name);
        }
      });
    });

    return {
      totalCourses,
      totalTeachers: totalTeachers.size,
      totalSemesters: sortedSemesters.length,
    };
  };

  const stats = calculateStats();

  return (
    <div
      className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mt-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="h-16 w-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-4">
                  <FaBook className="text-white text-3xl" />
                </div>
                <h1 className="text-2xl font-bold text-white">
                  Course Wise Reports
                </h1>
              </div>

              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300" />
                <select
                  id="academicYear"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white bg-opacity-20 text-white rounded-lg border border-blue-400 focus:outline-none focus:ring-2 focus:ring-white appearance-none"
                  disabled={loading}
                >
                  <option value="" disabled>
                    -- Select Academic Year --
                  </option>
                  {data.map((item, index) => (
                    <option
                      key={index}
                      value={item.academic_year}
                      className="text-gray-800"
                    >
                      {item.academic_year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="mt-4 text-center text-blue-100">
              View and analyze course performance across different semesters
            </p>
          </div>

          {/* Stats Cards */}
          {Object.keys(groupedData).length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-50 border-b border-gray-200">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                    <FaBook className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Courses</p>
                    <p className="text-xl font-bold text-gray-800">
                      {stats.totalCourses}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                    <FaUniversity className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Faculty Members</p>
                    <p className="text-xl font-bold text-gray-800">
                      {stats.totalTeachers}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                    <FaLayerGroup className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Semesters</p>
                    <p className="text-xl font-bold text-gray-800">
                      {stats.totalSemesters}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters Section */}
          {Object.keys(groupedData).length > 0 && (
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Search Filter */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaSearch className="mr-2 text-blue-500" />
                    Search Courses
                  </label>
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      className="pl-10 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      placeholder="Search by course code, name or faculty..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Semester Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaLayerGroup className="mr-2 text-blue-500" />
                    Semester
                  </label>
                  <select
                    className="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                  >
                    <option value="all">All Semesters</option>
                    {sortedSemesters.map((semester) => (
                      <option key={semester} value={semester}>
                        Semester {semester}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <FaSpinner className="animate-spin text-blue-500 text-4xl" />
              </div>
            ) : Object.keys(filteredGroupedData).length > 0 ? (
              sortedSemesters
                .filter(
                  (semester) =>
                    selectedSemester === "all" || selectedSemester === semester
                )
                .filter((semester) => filteredGroupedData[semester].length > 0)
                .map((semester) => (
                  <div
                    key={semester}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-8"
                  >
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                        <span className="text-blue-600 font-bold">
                          {semester}
                        </span>
                      </div>
                      Semester {semester}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredGroupedData[semester].map((course, index) => (
                        <div
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => handleCourseClick(course)}
                        >
                          <div className="bg-blue-50 px-4 py-3 border-b border-blue-100">
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {course.coursecode}
                              </span>
                              <FaChevronRight className="text-blue-400" />
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium text-gray-900 mb-1 truncate">
                              {course.course_name}
                            </h3>
                            {course.teacher_name && (
                              <p className="text-sm text-gray-500 flex items-center">
                                <FaUniversity className="mr-1 text-xs" />
                                {course.teacher_name}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
            ) : selectedYear ? (
              <div className="text-center py-20">
                <div className="mx-auto h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <FaBook className="text-blue-500 text-3xl" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No courses found
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {searchTerm
                    ? "No courses match your search criteria. Try adjusting your filters."
                    : "No courses available for the selected academic year."}
                </p>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="mx-auto h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <FaCalendarAlt className="text-blue-500 text-3xl" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Please select an academic year
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Select an academic year from the dropdown above to view course
                  reports.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {selectedYear && Object.keys(groupedData).length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex flex-wrap justify-between text-sm text-gray-600">
                <div>
                  Academic Year:{" "}
                  <span className="font-semibold">{selectedYear}</span>
                </div>
                <div>
                  Total Courses:{" "}
                  <span className="font-semibold">{stats.totalCourses}</span>
                </div>
                <div>
                  Generated on:{" "}
                  <span className="font-semibold">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseWiseReports;
