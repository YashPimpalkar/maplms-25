import React, { useState, useEffect } from "react";
import api from "../../api.js";

const CourseSelector = ({ uid, onUserCourseIdChange }) => {
  const [courses, setCourses] = useState([]);
  const [distinctCourses, setDistinctCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/copo/${uid}`);
        setCourses(res.data);

        const distinct = Array.from(
          new Set(res.data.map((course) => course.course_name))
        ).map((course_name) => ({
          course_name,
          academic_year: res.data.find(
            (course) => course.course_name === course_name
          ).academic_year,
        }));

        setDistinctCourses(distinct);
      } catch (error) {
        console.error("Error fetching course data:", error);
        setError("Failed to fetch course data");
      } finally {
        setLoading(false);
      }
    };

    if (uid) {
      fetchCourseData();
    }
  }, [uid]);

  const handleCourseChange = (event) => {
    setSelectedCourse(event.target.value);
    setSelectedYear("");
    onUserCourseIdChange(null); // Clear userCourseId
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);

    const selectedUserCourseId =
      courses.find(
        (course) =>
          course.course_name === selectedCourse &&
          course.academic_year === event.target.value
      )?.usercourse_id || null;

    onUserCourseIdChange(selectedUserCourseId);
  };

  return (
    <div className="w-full">
      {loading && (
        <p className="text-center text-gray-500">Loading courses...</p>
      )}
      {error && <p className="text-center text-red-500">{error}</p>}

      <div className="flex flex-col space-y-4">
        <div>
          <label
            htmlFor="course-select"
            className="block text-sm font-medium text-gray-700"
          >
            Select a Course
          </label>
          <select
            id="course-select"
            className="mt-1 block w-full py-1.5 px-3 border border-gray-300 bg-gray-100 text-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={selectedCourse}
            onChange={handleCourseChange}
          >
            <option value="">Select a course</option>
            {distinctCourses.map((course, index) => (
              <option key={index} value={course.course_name}>
                {course.course_name}
              </option>
            ))}
          </select>
        </div>

        {selectedCourse && (
          <div>
            <label
              htmlFor="year-select"
              className="block text-sm font-medium text-gray-700"
            >
              Select Academic Year
            </label>
            <select
              id="year-select"
              className="mt-1 block w-full py-1.5 px-3 border border-gray-300 bg-gray-100 text-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={selectedYear}
              onChange={handleYearChange}
            >
              <option value="">Select an academic year</option>
              {courses
                .filter((course) => course.course_name === selectedCourse)
                .map((course) => (
                  <option
                    key={course.usercourse_id}
                    value={course.academic_year}
                  >
                    {course.academic_year}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseSelector;
