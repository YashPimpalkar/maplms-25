import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../../../api";
import {
  FaBook,
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaLayerGroup,
  FaSpinner,
  FaFilePdf,
  FaChartBar,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CourseresultReports = () => {
  const location = useLocation();
  const {
    usercourseid,
    coursecode,
    coursename,
    academicYear,
    semester,
    teacher_name,
  } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]); // Course result data
  const [averagesdata, setAveragesData] = useState([]); // Averages data
  const [activeTab, setActiveTab] = useState("table"); // 'table' or 'chart'
  const [pdfGenerating, setPdfGenerating] = useState(false);

  // Fetch course result data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get(
          `/api/reports/getcourseresult/${usercourseid}`,
          { academicYear }
        );
        setData(res.data);
      } catch (err) {
        console.error("Error fetching course result data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [usercourseid, academicYear]);

  // Fetch averages data
  useEffect(() => {
    const fetchAverages = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/reports/getaverages/${usercourseid}`);
        setAveragesData(res.data);
      } catch (err) {
        console.error("Error fetching averages data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAverages();
  }, [usercourseid]);

  // Prepare chart data
  const prepareChartData = () => {
    if (!averagesdata.length) return null;

    const avg = averagesdata[0];

    return {
      labels: [
        "PO1",
        "PO2",
        "PO3",
        "PO4",
        "PO5",
        "PO6",
        "PO7",
        "PO8",
        "PO9",
        "PO10",
        "PO11",
        "PO12",
        "PSO1",
        "PSO2",
      ],
      datasets: [
        {
          label: "Average Attainment",
          data: [
            avg.po_1 || 0,
            avg.po_2 || 0,
            avg.po_3 || 0,
            avg.po_4 || 0,
            avg.po_5 || 0,
            avg.po_6 || 0,
            avg.po_7 || 0,
            avg.po_8 || 0,
            avg.po_9 || 0,
            avg.po_10 || 0,
            avg.po_11 || 0,
            avg.po_12 || 0,
            avg.pso_1 || 0,
            avg.pso_2 || 0,
          ],
          backgroundColor: "rgba(75, 85, 199, 0.7)",
          borderColor: "rgba(75, 85, 199, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "PO/PSO Attainment",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 3,
        title: {
          display: true,
          text: "Attainment Level",
        },
      },
    },
  };

  const chartData = prepareChartData();

  // Updated PDF generation function
  const generatePDF = async () => {
    setPdfGenerating(true);

    // Create a new window for printing
    const printWindow = window.open("", "_blank");

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
          <title>Course Result Reports - ${coursecode}</title>
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
            .course-details {
              text-align: center;
              font-size: 18px;
              margin-bottom: 30px;
              color: #5b21b6;
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
              text-align: center;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .co-badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 9999px;
              background-color: #e0e7ff;
              color: #4338ca;
              font-size: 12px;
              font-weight: 500;
            }
            .average-row {
              background-color: #e0e7ff;
              font-weight: bold;
            }
            .average-row td:first-child {
              color: #4338ca;
            }
            .high-value {
              color: #047857;
              font-weight: medium;
            }
            .medium-value {
              color: #1e40af;
            }
            .low-value {
              color: #d97706;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #6b7280;
            }
            .course-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              flex-wrap: wrap;
            }
            .info-item {
              background: #f3f4f6;
              padding: 10px 15px;
              border-radius: 8px;
              margin-bottom: 10px;
            }
            .info-label {
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 4px;
            }
            .info-value {
              font-size: 16px;
              font-weight: bold;
              color: #1f2937;
            }
          </style>
        </head>
        <body>
          <div class="report-container">
            <img class="college-header" src="/images/CollegeHeader.png" alt="College Header" />
            <h1 class="report-title">Course Result Reports</h1>
            <div class="course-details">${coursecode}: ${coursename}</div>
            
            <div class="course-info">
              <div class="info-item">
                <div class="info-label">Course Code</div>
                <div class="info-value">${coursecode}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Academic Year</div>
                <div class="info-value">${academicYear}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Faculty</div>
                <div class="info-value">${teacher_name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Semester</div>
                <div class="info-value">${semester}</div>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th style="text-align: left;">CO Name</th>
                  ${[...Array(12)]
                    .map((_, i) => `<th>PO${i + 1}</th>`)
                    .join("")}
                  ${[...Array(2)]
                    .map((_, i) => `<th>PSO${i + 1}</th>`)
                    .join("")}
                </tr>
              </thead>
              <tbody>
    `);

    // Add table rows for course outcomes
    data.forEach((item, index) => {
      printWindow.document.write(`
        <tr class="${index % 2 === 0 ? "" : "even-row"}">
          <td style="text-align: left;">
            <span class="co-badge">${item.co_name}</span>
          </td>
          <td>${formatPOValue(item.po_1)}</td>
          <td>${formatPOValue(item.po_2)}</td>
          <td>${formatPOValue(item.po_3)}</td>
          <td>${formatPOValue(item.po_4)}</td>
          <td>${formatPOValue(item.po_5)}</td>
          <td>${formatPOValue(item.po_6)}</td>
          <td>${formatPOValue(item.po_7)}</td>
          <td>${formatPOValue(item.po_8)}</td>
          <td>${formatPOValue(item.po_9)}</td>
          <td>${formatPOValue(item.po_10)}</td>
          <td>${formatPOValue(item.po_11)}</td>
          <td>${formatPOValue(item.po_12)}</td>
          <td>${formatPOValue(item.pso_1)}</td>
          <td>${formatPOValue(item.pso_2)}</td>
        </tr>
      `);
    });

    // Add average row
    if (averagesdata.length > 0) {
      const avg = averagesdata[0];
      printWindow.document.write(`
        <tr class="average-row">
          <td style="text-align: left;">Average</td>
          <td>${formatPOValue(avg.po_1)}</td>
          <td>${formatPOValue(avg.po_2)}</td>
          <td>${formatPOValue(avg.po_3)}</td>
          <td>${formatPOValue(avg.po_4)}</td>
          <td>${formatPOValue(avg.po_5)}</td>
          <td>${formatPOValue(avg.po_6)}</td>
          <td>${formatPOValue(avg.po_7)}</td>
          <td>${formatPOValue(avg.po_8)}</td>
          <td>${formatPOValue(avg.po_9)}</td>
          <td>${formatPOValue(avg.po_10)}</td>
          <td>${formatPOValue(avg.po_11)}</td>
          <td>${formatPOValue(avg.po_12)}</td>
          <td>${formatPOValue(avg.pso_1)}</td>
          <td>${formatPOValue(avg.pso_2)}</td>
        </tr>
      `);
    }

    // Close the table and add footer
    printWindow.document.write(`
              </tbody>
            </table>
            
            <div style="margin-top: 30px;">
              <h3 style="font-size: 16px; margin-bottom: 10px;">Attainment Legend</h3>
              <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                <div style="display: flex; align-items: center;">
                  <div style="width: 12px; height: 12px; border-radius: 50%; background-color: #047857; margin-right: 8px;"></div>
                  <span style="font-size: 14px;">High (≥ 2.5)</span>
                </div>
                <div style="display: flex; align-items: center;">
                  <div style="width: 12px; height: 12px; border-radius: 50%; background-color: #1e40af; margin-right: 8px;"></div>
                  <span style="font-size: 14px;">Medium (1.5 - 2.49)</span>
                </div>
                <div style="display: flex; align-items: center;">
                  <div style="width: 12px; height: 12px; border-radius: 50%; background-color: #d97706; margin-right: 8px;"></div>
                  <span style="font-size: 14px;">Low (0.5 - 1.49)</span>
                </div>
              </div>
            </div>
            
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

  // Helper function to format PO values for the PDF
  const formatPOValue = (value) => {
    if (!value || value === 0) {
      return '<span style="color: #9ca3af;">-</span>';
    }

    const numValue = parseFloat(value);
    let className = "";

    if (numValue >= 2.5) {
      className = "high-value";
    } else if (numValue >= 1.5) {
      className = "medium-value";
    } else if (numValue >= 0.5) {
      className = "low-value";
    }

    return `<span class="${className}">${value}</span>`;
  };

  // Helper function to render PO values with appropriate styling
  const renderPOValue = (value) => {
    if (!value || value === 0) {
      return <span className="text-gray-400">-</span>;
    }

    // Color coding based on value
    let colorClass = "text-gray-800";
    if (value >= 2.5) {
      colorClass = "text-green-600 font-medium";
    } else if (value >= 1.5) {
      colorClass = "text-blue-600";
    } else if (value >= 0.5) {
      colorClass = "text-orange-500";
    }

    return <span className={colorClass}>{value}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mt-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="h-16 w-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-4">
                  <FaBook className="text-white text-3xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Course Result Reports
                  </h1>
                  <p className="text-indigo-200">
                    {coursecode}: {coursename}
                  </p>
                </div>
              </div>

              <button
                onClick={generatePDF}
                disabled={pdfGenerating}
                className="flex items-center px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
              >
                {pdfGenerating ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FaFilePdf className="mr-2" />
                    Export PDF
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Course Details Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-50 border-b border-gray-200">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                  <FaBook className="text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Course Code</p>
                  <p className="text-xl font-bold text-gray-800">
                    {coursecode}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                  <FaCalendarAlt className="text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Academic Year</p>
                  <p className="text-xl font-bold text-gray-800">
                    {academicYear}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                  <FaChalkboardTeacher className="text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Faculty</p>
                  <p className="text-xl font-bold text-gray-800 truncate">
                    {teacher_name}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="px-6 pt-4 border-b border-gray-200">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab("table")}
                className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                  activeTab === "table"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Table View
              </button>

              <button
                onClick={() => setActiveTab("chart")}
                className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                  activeTab === "chart"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Chart View
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <FaSpinner className="animate-spin text-indigo-500 text-4xl" />
              </div>
            ) : activeTab === "table" ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        CO Name
                      </th>
                      {[...Array(12)].map((_, i) => (
                        <th
                          key={i}
                          className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider"
                        >
                          PO{i + 1}
                        </th>
                      ))}
                      {[...Array(2)].map((_, i) => (
                        <th
                          key={i}
                          className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider"
                        >
                          PSO{i + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {item.co_name}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          {renderPOValue(item.po_1)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          {renderPOValue(item.po_2)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          {renderPOValue(item.po_3)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          {renderPOValue(item.po_4)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          {renderPOValue(item.po_5)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          {renderPOValue(item.po_6)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          {renderPOValue(item.po_7)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          {renderPOValue(item.po_8)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          {renderPOValue(item.po_9)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          {renderPOValue(item.po_10)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          {renderPOValue(item.po_11)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          {renderPOValue(item.po_12)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          {renderPOValue(item.pso_1)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          {renderPOValue(item.pso_2)}
                        </td>
                      </tr>
                    ))}
                    {averagesdata.map((avg, index) => (
                      <tr
                        key={`avg-${index}`}
                        className="bg-indigo-50 font-semibold"
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-indigo-700">
                          Average
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          {renderPOValue(avg.po_1)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          {renderPOValue(avg.po_2)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          {renderPOValue(avg.po_3)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          {renderPOValue(avg.po_4)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          {renderPOValue(avg.po_5)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          {renderPOValue(avg.po_6)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          {renderPOValue(avg.po_7)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          {renderPOValue(avg.po_8)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          {renderPOValue(avg.po_9)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          {renderPOValue(avg.po_10)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          {renderPOValue(avg.po_11)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          {renderPOValue(avg.po_12)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          {renderPOValue(avg.pso_1)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          {renderPOValue(avg.pso_2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                {chartData ? (
                  <div className="h-96">
                    <Bar data={chartData} options={chartOptions} />
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="mx-auto h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                      <FaChartBar className="text-indigo-500 text-xl" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No chart data available
                    </h3>
                    <p className="text-gray-500">
                      There is no attainment data to display in the chart.
                    </p>
                  </div>
                )}

                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Attainment Legend
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-green-600 mr-2"></div>
                      <span className="text-sm text-gray-700">
                        High (≥ 2.5)
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-blue-600 mr-2"></div>
                      <span className="text-sm text-gray-700">
                        Medium (1.5 - 2.49)
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-orange-500 mr-2"></div>
                      <span className="text-sm text-gray-700">
                        Low (0.5 - 1.49)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex flex-wrap justify-between text-sm text-gray-600">
              <div>
                Course:{" "}
                <span className="font-semibold">
                  {coursecode}: {coursename}
                </span>
              </div>
              <div>
                Semester: <span className="font-semibold">{semester}</span>
              </div>
              <div>
                Generated on:{" "}
                <span className="font-semibold">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseresultReports;
