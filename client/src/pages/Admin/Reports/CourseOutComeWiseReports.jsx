import React, { useEffect, useState, useRef } from "react";
import api from "../../../api";
import {
  FaBook,
  FaCalendarAlt,
  FaSpinner,
  FaFilePdf,
  FaChartBar,
  FaUniversity,
} from "react-icons/fa";
import { motion } from "framer-motion";

const CourseOutcomeWiseReports = ({ uid }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [Coursedata, setCoursedata] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const tableRefs = useRef([]);

  const addToRefs = (el) => {
    if (el && !tableRefs.current.includes(el)) {
      tableRefs.current.push(el);
    }
  };

  // Fetch academic years on component mount
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

  // Fetch course data whenever selectedYear changes
  useEffect(() => {
    if (!selectedYear) return;

    const CourseChange = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/reports/courseoutcome/${uid}`, {
          params: { selectedYear },
        });
        setCoursedata(res.data);
      } catch (err) {
        console.error("Error fetching course data:", err);
      } finally {
        setLoading(false);
      }
    };

    CourseChange();
  }, [selectedYear, uid]);

  // Group data by course code and course name
  const groupedData = Coursedata.reduce((acc, item) => {
    const key = `${item.coursecode} ${item.course_name}`;
    if (!acc[key]) {
      acc[key] = { courseDetails: item, outcomes: [] };
    }
    acc[key].outcomes.push(item);
    return acc;
  }, {});

  // Filter grouped data based on search term
  const filteredGroupedData = Object.entries(groupedData)
    .filter(([key]) => key.toLowerCase().includes(searchTerm.toLowerCase()))
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

  const groupedDataArray = Object.values(filteredGroupedData);

    // Update the generatePDF function to properly handle printing
    const generatePDF = async () => {
      setPdfGenerating(true);
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        alert("Please allow pop-ups to generate the PDF");
        setPdfGenerating(false);
        return;
      }
      
      // Get the current date for the report
      const currentDate = new Date().toLocaleDateString();
      
      // Write the HTML content to the new window
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Course Outcome Wise Reports - ${selectedYear}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background: white;
              }
              .report-container {
                max-width: 100%;
                margin: 0 auto;
                padding: 20px;
              }
              .college-header {
                width: 100%;
                margin-bottom: 20px;
              }
              .report-title {
                text-align: center;
                font-size: 24px;
                font-weight: bold;
                margin: 20px 0;
                color: #4338ca;
              }
              .academic-year {
                text-align: center;
                font-size: 18px;
                margin-bottom: 30px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
              }
              th {
                background-color: #6d28d9;
                color: white;
                text-align: left;
                padding: 12px;
                font-size: 14px;
                text-transform: uppercase;
              }
              td {
                padding: 12px;
                border-bottom: 1px solid #e5e7eb;
                font-size: 14px;
              }
              tr:nth-child(even) {
                background-color: #f9fafb;
              }
              .course-code {
                font-weight: bold;
              }
              .course-name {
                color: #6b7280;
              }
              .co-badge {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 9999px;
                background-color: #dbeafe;
                color: #1e40af;
                font-size: 12px;
                font-weight: 500;
              }
              .attainment-badge {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 9999px;
                font-size: 12px;
                font-weight: 500;
                text-align: center;
              }
              .attainment-high {
                background-color: #d1fae5;
                color: #065f46;
              }
              .attainment-medium {
                background-color: #dbeafe;
                color: #1e40af;
              }
              .attainment-low {
                background-color: #fef3c7;
                color: #92400e;
              }
              .attainment-poor {
                background-color: #fee2e2;
                color: #b91c1c;
              }
              .footer {
                margin-top: 30px;
                text-align: center;
                font-size: 12px;
                color: #6b7280;
              }
              .sr-no {
                text-align: center;
              }
              .sr-no-circle {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                background-color: #dbeafe;
                color: #1e40af;
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <div class="report-container">
              <img class="college-header" src="/images/CollegeHeader.png" alt="College Header" />
              <h1 class="report-title">Course Outcome Wise Reports</h1>
              <div class="academic-year">Academic Year: ${selectedYear}</div>
              
              <table>
                <thead>
                  <tr>
                    <th class="sr-no">Sr. No.</th>
                    <th>Course Code With Course</th>
                    <th>Course Outcomes</th>
                    <th style="text-align: center;">CO Attainment</th>
                  </tr>
                </thead>
                <tbody>
      `);
      
      // Add table rows
      groupedDataArray.forEach((group, groupIndex) => {
        group.outcomes.forEach((item, outcomeIndex) => {
          if (outcomeIndex === 0) {
            // First row of a course group
            printWindow.document.write(`
              <tr>
                <td class="sr-no" rowspan="${group.outcomes.length}">
                  <div class="sr-no-circle">${groupIndex + 1}</div>
                </td>
                <td rowspan="${group.outcomes.length}">
                  <div class="course-code">${group.courseDetails.coursecode}</div>
                  <div class="course-name">${group.courseDetails.course_name}</div>
                </td>
                <td>
                  <span class="co-badge">${item.co_name}</span>
                </td>
                <td style="text-align: center;">
                  ${getAttainmentBadgeHTML(item.co_attainment)}
                </td>
              </tr>
            `);
          } else {
            // Subsequent rows of a course group
            printWindow.document.write(`
              <tr>
                <td>
                  <span class="co-badge">${item.co_name}</span>
                </td>
                <td style="text-align: center;">
                  ${getAttainmentBadgeHTML(item.co_attainment)}
                </td>
              </tr>
            `);
          }
        });
      });
      
      // Close the table and add footer
      printWindow.document.write(`
                </tbody>
              </table>
              
              <div class="footer">
                Generated on: ${currentDate}
              </div>
            </div>
            <script>
              // Fix image path issue
              document.addEventListener('DOMContentLoaded', function() {
                const img = document.querySelector('.college-header');
                img.onerror = function() {
                  this.src = 'https://vppcoe.edu.in/wp-content/uploads/2023/02/VPPCOE-Logo.png';
                };
                
                // Print automatically when loaded
                window.onload = function() {
                  setTimeout(() => {
                    window.print();
                    setTimeout(() => {
                      window.close();
                    }, 500);
                  }, 1000);
                };
              });
            </script>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      setPdfGenerating(false);
    };
    
    // Helper function to generate HTML for attainment badges
    const getAttainmentBadgeHTML = (value) => {
      if (!value) {
        return '<span style="color: #9ca3af;">-</span>';
      }
      
      const numValue = parseFloat(value);
      let badgeClass = 'attainment-poor';
      
      if (numValue >= 3) {
        badgeClass = 'attainment-high';
      } else if (numValue >= 2) {
        badgeClass = 'attainment-medium';
      } else if (numValue >= 1) {
        badgeClass = 'attainment-low';
      }
      
      return `<span class="attainment-badge ${badgeClass}">${value}</span>`;
    };

  // Calculate summary statistics
  const calculateStats = () => {
    const totalCourses = groupedDataArray.length;
    const totalOutcomes = groupedDataArray.reduce(
      (sum, group) => sum + group.outcomes.length,
      0
    );

    // Calculate average attainment
    let totalAttainment = 0;
    let attainmentCount = 0;

    groupedDataArray.forEach((group) => {
      group.outcomes.forEach((outcome) => {
        if (outcome.co_attainment) {
          totalAttainment += parseFloat(outcome.co_attainment);
          attainmentCount++;
        }
      });
    });

    const averageAttainment =
      attainmentCount > 0 ? (totalAttainment / attainmentCount).toFixed(2) : 0;

    return { totalCourses, totalOutcomes, averageAttainment };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <img
        id="banner_for_output"
        style={{ display: "None" }}
        src="/images/CollegeHeader.png"
        alt=""
      />

      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mt-5">
          {/* Header */}
          <div className="bg-gradient-to-r bg-indigo-700 px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="h-16 w-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-4">
                  <FaChartBar className="text-white text-3xl" />
                </div>
                <h1 className="text-2xl font-bold text-white">
                  Course Outcome Wise Reports
                </h1>
              </div>

              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" />
                <select
                  id="academicYear"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white bg-opacity-20 text-white rounded-lg border border-purple-400 focus:outline-none focus:ring-2 focus:ring-white appearance-none"
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
          </div>
          {/* Stats Cards */}
          {groupedDataArray.length > 0 && (
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
                    <FaChartBar className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Outcomes</p>
                    <p className="text-xl font-bold text-gray-800">
                      {stats.totalOutcomes}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                    <FaUniversity className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Avg. Attainment</p>
                    <p className="text-xl font-bold text-gray-800">
                      {stats.averageAttainment}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Search Bar */}
          {groupedDataArray.length > 0 && (
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <FaBook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          )}
          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <FaSpinner className="animate-spin text-blue-500 text-4xl" />
              </div>
            ) : groupedDataArray.length > 0 ? (
              <div className="overflow-x-auto" ref={addToRefs}>
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                  <thead>
                    SemesterWiseReports
                    <tr className="bg-gradient-to-r bg-purple-600 text-white">
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-16">
                        Sr. No.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Course Code With Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Course Outcomes
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider w-32">
                        CO Attainment
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {groupedDataArray.map((group, groupIndex) => (
                      <React.Fragment key={groupIndex}>
                        {group.outcomes.map((item, outcomeIndex) => (
                          <tr
                            key={outcomeIndex}
                            className={
                              outcomeIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            {outcomeIndex === 0 && (
                              <>
                                <td
                                  className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center border-r border-gray-200"
                                  rowSpan={group.outcomes.length}
                                >
                                  <div className="flex items-center justify-center">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                      <span className="text-blue-600 font-bold">
                                        {groupIndex + 1}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td
                                  className="px-6 py-4 text-sm text-gray-900 border-r border-gray-200"
                                  rowSpan={group.outcomes.length}
                                >
                                  <div className="flex items-center">
                                    <FaBook className="text-blue-500 mr-2 flex-shrink-0" />
                                    <div>
                                      <div className="font-medium">
                                        {group.courseDetails.coursecode}
                                      </div>
                                      <div className="text-gray-500">
                                        {group.courseDetails.course_name}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </>
                            )}
                            <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {item.co_name}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                              {renderAttainmentValue(item.co_attainment)}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>

                <div className="mt-6 flex justify-end">
                  <button
                    id="downloadButton"
                    onClick={generatePDF}
                    disabled={pdfGenerating}
                    className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md disabled:bg-gray-400"
                  >
                    {pdfGenerating ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <FaFilePdf className="mr-2" />
                        Download PDF Report
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : selectedYear ? (
              <div className="text-center py-20">
                <div className="mx-auto h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <FaBook className="text-blue-500 text-3xl" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No course data available
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  There are no course outcomes available for the selected
                  academic year.
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
                  outcome reports.
                </p>
              </div>
            )}
          </div>
          {/* Footer */}
          {selectedYear && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex flex-wrap justify-between text-sm text-gray-600">
                <div>
                  Academic Year:{" "}
                  <span className="font-semibold">{selectedYear}</span>
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

// Helper function to render attainment values with appropriate styling
const renderAttainmentValue = (value) => {
  if (!value) {
    return <span className="text-gray-400">-</span>;
  }

  const numValue = parseFloat(value);

  // Color coding based on attainment level
  let colorClass = "bg-red-100 text-red-800";
  if (numValue >= 3) {
    colorClass = "bg-green-100 text-green-800";
  } else if (numValue >= 2) {
    colorClass = "bg-blue-100 text-blue-800";
  } else if (numValue >= 1) {
    colorClass = "bg-yellow-100 text-yellow-800";
  }

  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
    >
      {value}
    </span>
  );
};

export default CourseOutcomeWiseReports;
