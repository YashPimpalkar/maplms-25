import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../../../api";
import AnimatedProgressBar from "../../../components/AnimatedProgressbar/AnimatedProgressBar";
import {
  FaChalkboardTeacher,
  FaBook,
  FaCalendarAlt,
  FaSpinner,
  FaChartBar,
  FaUniversity,
} from "react-icons/fa";
import { motion } from "framer-motion";

const UserWiseDetails = ({ uid }) => {
  const location = useLocation();
  const { userid, depart, selectedYear, teacher_name } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/reports/getteachercouser/${userid}`, {
          params: { selectedYear },
        });
        setData(res.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uid, selectedYear, userid]);

  // Group data by semester and course
  const groupedData = data.reduce((acc, item) => {
    const semesterKey = `Semester ${item.semester}`;
    if (!acc[semesterKey]) acc[semesterKey] = {};

    const courseKey = `${item.coursecode} - ${item.course_name}`;
    if (!acc[semesterKey][courseKey]) acc[semesterKey][courseKey] = [];

    // Add usercourse_id for each item in the grouped data
    acc[semesterKey][courseKey].push({
      ...item,
      usercourse_id: item.usercourse_id,
    });

    return acc;
  }, {});

  // Get unique semesters for tabs
  const semesters = Object.keys(groupedData);

  // Calculate summary statistics
  const calculateStats = () => {
    let totalCourses = 0;
    let totalPOEntries = 0;

    Object.keys(groupedData).forEach((semester) => {
      const courses = Object.keys(groupedData[semester]);
      totalCourses += courses.length;

      courses.forEach((course) => {
        totalPOEntries += groupedData[semester][course].length;
      });
    });

    return { totalCourses, totalPOEntries, totalSemesters: semesters.length };
  };

  const stats = calculateStats();

  return (
    <div
      className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mt-5">
          {/* Header */}
          <div className="bg-gradient-to-r bg-indigo-700 px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="h-16 w-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-4">
                  <FaChalkboardTeacher className="text-white text-3xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {teacher_name}
                  </h1>
                  <p className="text-indigo-200">
                    Department: {depart || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg flex items-center">
                  <FaCalendarAlt className="text-white mr-2" />
                  <span className="text-white">{selectedYear}</span>
                </div>
                <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg flex items-center">
                  <FaUniversity className="text-white mr-2" />
                  <span className="text-white">ID: {userid}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-50 border-b border-gray-200">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
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
                <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                  <FaChartBar className="text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">PO Entries</p>
                  <p className="text-xl font-bold text-gray-800">
                    {stats.totalPOEntries}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                  <FaCalendarAlt className="text-xl" />
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

          {/* Semester Tabs */}
          <div className="px-6 pt-4 border-b border-gray-200 overflow-x-auto">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                  activeTab === "all"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Semesters
              </button>

              {semesters.map((semester, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(semester)}
                  className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                    activeTab === semester
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {semester}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <FaSpinner className="animate-spin text-indigo-500 text-4xl" />
              </div>
            ) : Object.keys(groupedData).length > 0 ? (
              <>
                {(activeTab === "all" ? semesters : [activeTab]).map(
                  (semester, semIndex) => (
                    <div
                      key={semIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: semIndex * 0.1 }}
                      className="mb-10"
                    >
                      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                          <span className="text-indigo-600 font-bold">
                            {semIndex + 1}
                          </span>
                        </div>
                        {semester}
                      </h2>

                      {Object.keys(groupedData[semester]).map(
                        (course, courseIndex) => (
                          <div
                            key={courseIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{
                              duration: 0.3,
                              delay: courseIndex * 0.05,
                            }}
                            className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                          >
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                <FaBook className="text-indigo-500 mr-2" />
                                {course}
                              </h3>
                            </div>

                            <div className="p-4">
                              <AnimatedProgressBar
                              
                                usercourseid={
                                  groupedData[semester][course][0].usercourse_id
                                }
                              />
                            </div>

                            <div className="overflow-x-auto px-4 pb-4">
                              <table className="min-w-full border-collapse">
                                <thead>
                                  <tr>
                                    <th className="bg-indigo-600 text-white px-4 py-3 text-left text-sm font-medium rounded-tl-lg">
                                      Set/Target
                                    </th>
                                    {[...Array(12)].map((_, i) => (
                                      <th
                                        key={i}
                                        className="bg-indigo-600 text-white px-4 py-3 text-center text-sm font-medium"
                                      >
                                        PO{i + 1}
                                      </th>
                                    ))}
                                    {[...Array(2)].map((_, i) => (
                                      <th
                                        key={i}
                                        className={`bg-indigo-600 text-white px-4 py-3 text-center text-sm font-medium ${
                                          i === 1 ? "rounded-tr-lg" : ""
                                        }`}
                                      >
                                        PSO{i + 1}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {groupedData[semester][course].map(
                                    (item, idx) => (
                                      <tr
                                        key={idx}
                                        className={
                                          idx % 2 === 0
                                            ? "bg-white"
                                            : "bg-gray-50"
                                        }
                                      >
                                        <td className="px-4 py-3 border-b border-gray-200 text-sm font-medium">
                                          <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                              item.isset === 0
                                                ? "bg-blue-100 text-blue-800"
                                                : item.isset === 1
                                                ? "bg-green-100 text-green-800"
                                                : "bg-gray-100 text-gray-800"
                                            }`}
                                          >
                                            {item.isset === 0
                                              ? "Set"
                                              : item.isset === 1
                                              ? "Target"
                                              : "Not Set"}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 border-b border-gray-200 text-sm text-center">
                                          {renderPOValue(item.po_1)}
                                        </td>
                                        <td className="px-4 py-3 border-b border-gray-200 text-sm text-center">
                                          {renderPOValue(item.po_2)}
                                        </td>
                                        <td className="px-4 py-3 border-b border-gray-200 text-sm text-center">
                                          {renderPOValue(item.po_3)}
                                        </td>
                                        <td className="px-4 py-3 border-b border-gray-200 text-sm text-center">
                                          {renderPOValue(item.po_4)}
                                        </td>
                                        <td className="px-4 py-3 border-b border-gray-200 text-sm text-center">
                                          {renderPOValue(item.po_5)}
                                        </td>
                                        <td className="px-4 py-3 border-b border-gray-200 text-sm text-center">
                                          {renderPOValue(item.po_6)}
                                        </td>
                                        <td className="px-4 py-3 border-b border-gray-200 text-sm text-center">
                                          {renderPOValue(item.po_7)}
                                        </td>
                                        <td className="px-4 py-3 border-b border-gray-200 text-sm text-center">
                                          {renderPOValue(item.po_8)}
                                        </td>
                                        <td className="px-4 py-3 border-b border-gray-200 text-sm text-center">
                                          {renderPOValue(item.po_9)}
                                        </td>
                                        <td className="px-4 py-3 border-b border-gray-200 text-sm text-center">
                                          {renderPOValue(item.po_10)}
                                        </td>
                                        <td className="px-4 py-3 border-b border-gray-200 text-sm text-center">
                                          {renderPOValue(item.po_11)}
                                        </td>
                                        <td className="px-4 py-3 border-b border-gray-200 text-sm text-center">
                                          {renderPOValue(item.po_12)}
                                        </td>
                                        <td className="px-4 py-3 border-b border-gray-200 text-sm text-center">
                                          {renderPOValue(item.pso_1)}
                                        </td>
                                        <td className="px-4 py-3 border-b border-gray-200 text-sm text-center">
                                          {renderPOValue(item.pso_2)}
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <div className="mx-auto h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                  <FaChartBar className="text-indigo-500 text-3xl" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No course data available
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  There are no courses or PO data available for this faculty
                  member in the selected academic year.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex flex-wrap justify-between text-sm text-gray-600">
              <div>
                Faculty: <span className="font-semibold">{teacher_name}</span>
              </div>
              <div>
                Department:{" "}
                <span className="font-semibold">
                  {depart || "Not specified"}
                </span>
              </div>
              <div>
                Academic Year:{" "}
                <span className="font-semibold">{selectedYear}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to render PO values with appropriate styling
const renderPOValue = (value) => {
  if (!value || value === 0) {
    return <span className="text-gray-400">-</span>;
  }

  // Color coding based on value
  let colorClass = "text-gray-800";
  if (value >= 3) {
    colorClass = "text-green-600 font-medium";
  } else if (value >= 2) {
    colorClass = "text-blue-600";
  } else if (value >= 1) {
    colorClass = "text-orange-500";
  }

  return <span className={colorClass}>{value}</span>;
};

export default UserWiseDetails;
