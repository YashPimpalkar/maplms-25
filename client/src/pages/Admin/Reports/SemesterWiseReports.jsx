import React, { useEffect, useState, useRef } from "react";
import api from "../../../api";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { FaBook, FaCalendarAlt, FaSpinner, FaFilePdf, FaLayerGroup, FaChalkboardTeacher } from "react-icons/fa";
import { motion } from "framer-motion";

const SemesterWiseReports = ({ uid }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [mergedCourses, setMergedCourses] = useState([]);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const tableRefs = useRef([]);

  const addToRefs = (el) => {
    if (el && !tableRefs.current.includes(el)) {
      tableRefs.current.push(el);
    }
  };

  // Fetch academic years on component mount
  useEffect(() => {
    const fetchAcademicYears = async () => {
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

    fetchAcademicYears();
  }, [uid]);

  // Fetch course data whenever selectedYear changes
  useEffect(() => {
    if (!selectedYear) return;

    const fetchCoursesAndMergeData = async () => {
      try {
        setLoading(true);
        tableRefs.current = []; // Clear refs when fetching new data

        // Fetch courses for the selected year
        const coursesRes = await api.get(
          `/api/reports/getsemesterwiseuid/${uid}`,
          {
            params: { selectedYear },
          }
        );
        const courses = coursesRes.data;

        // Prepare arrays for merging results and averages
        const mergedData = [];

        // Fetch results and averages for each course
        for (let course of courses) {
          try {
            const [resultsRes, averagesRes] = await Promise.all([
              api.get(`api/reports/getcourseresult/${course.usercourse_id}`),
              api.get(`/api/reports/getaverages/${course.usercourse_id}`),
            ]);

            mergedData.push({
              ...course,
              results: resultsRes.data || [],
              averages: averagesRes.data || [],
            });
          } catch (err) {
            console.error(
              `Error fetching data for course ${course.usercourse_id}:`,
              err
            );
          }
        }

        // Group by semester and sort
        const groupedBySemester = mergedData.reduce((acc, course) => {
          if (!acc[course.semester]) {
            acc[course.semester] = [];
          }
          acc[course.semester].push(course);
          return acc;
        }, {});

        // Sort semesters and courses within semesters
        const sortedData = [];
        Object.keys(groupedBySemester)
          .sort((a, b) => parseInt(a) - parseInt(b))
          .forEach(semester => {
            const sortedCourses = groupedBySemester[semester].sort((a, b) => 
              a.coursecode.localeCompare(b.coursecode)
            );
            sortedData.push(...sortedCourses);
          });

        setMergedCourses(sortedData);
      } catch (err) {
        console.error("Error fetching course data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesAndMergeData();
  }, [selectedYear, uid]);

  const generatePDF = async () => {
    setPdfGenerating(true);
    const pdf = new jsPDF();
  
    const collegeHeader = "/images/CollegeHeader.png";
    let yPosition = 20; // Initial Y position after the header
  
    // Flag to check if it's the first table
    let isFirstTable = true;
    let currentSemester = null; // Track the current semester
  
    for (const table of tableRefs.current) {
      if (table) {
        // Add header image
        const headerImage = new Image();
        headerImage.src = collegeHeader;
  
        // Wait for the header image to load
        await new Promise((resolve) => {
          headerImage.onload = resolve;
        });
  
        const semester = table.getAttribute("data-semester"); // Assuming you set `data-semester` for each table div
  
        // Check if the semester has changed
        if (semester !== currentSemester) {
          if (!isFirstTable) {
            pdf.addPage(); // Add a new page for a new semester
          }
  
          // Add header to the new page
          pdf.addImage(headerImage, "PNG", 10, 10, 190, 20);
          yPosition = 40; // Reset Y position
          
          // Add semester heading
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(16);
          pdf.setTextColor(75, 0, 130); // Purple color
          pdf.text(`Semester ${semester} - ${selectedYear}`, 105, yPosition, { align: 'center' });
          yPosition += 10; // Add space after the heading
          
          currentSemester = semester; // Update current semester
        }
  
        isFirstTable = false; // Ensure only the first header gets the extra margin
  
        // Capture table as an image
        const canvas = await html2canvas(table);
        const imgData = canvas.toDataURL("image/png");
        const imgWidth = 190; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
        // Check if the table fits on the current page
        const remainingPageHeight = 280 - yPosition; // Remaining space on the page (280 is A4 height minus margins)
        if (imgHeight > remainingPageHeight) {
          pdf.addPage(); // Add a new page if the table doesn't fit
          yPosition = 40; // Reset Y position for the new page
  
          // Add the header to the new page
          pdf.addImage(headerImage, "PNG", 10, 10, 190, 20);
          
          // Add semester heading again on the new page
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(16);
          pdf.setTextColor(75, 0, 130); // Purple color
          pdf.text(`Semester ${semester} - ${selectedYear}`, 105, yPosition, { align: 'center' });
          yPosition += 10; // Add space after the heading
        }
  
        // Add the table image to the PDF
        pdf.addImage(imgData, "PNG", 10, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 20; // Update yPosition for the next table
      }
    }
  
    // Save the PDF
    pdf.save(`Semester_Wise_Reports_${selectedYear}.pdf`);
    setPdfGenerating(false);
  };

  // Helper function to render PO values with appropriate styling
  const renderPOValue = (value) => {
    if (!value || value === "-") {
      return <span className="text-gray-400">-</span>;
    }
    
    const numValue = parseFloat(value);
    
    // Color coding based on value
    let colorClass = "text-gray-800";
    if (numValue >= 2.5) {
      colorClass = "text-green-600 font-medium";
    } else if (numValue >= 1.5) {
      colorClass = "text-blue-600";
    } else if (numValue >= 0.5) {
      colorClass = "text-orange-500";
    }
    
    return <span className={colorClass}>{value}</span>;
  };

  // Group courses by semester
  const coursesBySemester = mergedCourses.reduce((acc, course) => {
    if (!acc[course.semester]) {
      acc[course.semester] = [];
    }
    acc[course.semester].push(course);
    return acc;
  }, {});

  // Sort semesters
  const sortedSemesters = Object.keys(coursesBySemester).sort(
    (a, b) => parseInt(a) - parseInt(b)
  );

  return (
    <div 
      className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8"
    >
      <img
        id="banner_for_output"
        style={{ display: "none" }}
        src="/images/CollegeHeader.png"
        alt=""
      />

      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mt-5">
          {/* Header */}
          <div className="bg-gradient-to-r  bg-indigo-700 px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="h-16 w-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-4">
                  <FaLayerGroup className="text-white text-3xl" />
                </div>
                <h1 className="text-2xl font-bold text-white">
                  Semester Wise Reports
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
                    <option key={index} value={item.academic_year} className="text-gray-800">
                      {item.academic_year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <FaSpinner className="animate-spin text-purple-500 text-4xl" />
              </div>
            ) : sortedSemesters.length > 0 ? (
              <div>
                {sortedSemesters.map((semester) => (
                  <div
                    key={semester}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-10"
                  >
                    <div className="flex items-center mb-6">
                      <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                        <span className="text-purple-600 font-bold text-xl">{semester}</span>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        Semester {semester}
                      </h2>
                    </div>

                    {coursesBySemester[semester].map((course, courseIndex) => (
                      <div 
                        key={courseIndex} 
                        className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                        ref={el => addToRefs(el)} 
                        data-semester={course.semester}
                      >
                        <div className="bg-purple-50 px-6 py-4 border-b border-purple-100">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center mb-2 md:mb-0">
                              <FaBook className="text-purple-500 mr-2" />
                              <h3 className="text-lg font-semibold text-gray-800">
                                {course.coursecode} - {course.course_name}
                              </h3>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <FaChalkboardTeacher className="mr-1" />
                              <span>{course.teacher_name || "No teacher assigned"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="overflow-x-auto p-4">
                          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                            <thead>
                              <tr className="bg-gradient-to-r bg-purple-600  text-white">
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                  CO Name
                                </th>
                                {[...Array(12)].map((_, i) => (
                                  <th key={i} className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                                    PO{i + 1}
                                  </th>
                                ))}
                                {[...Array(2)].map((_, i) => (
                                  <th key={i} className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                                    PSO{i + 1}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {course.results.map((result, resultIndex) => (
                                <tr key={resultIndex} className={resultIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                      {result.co_name}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(result.po_1)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(result.po_2)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(result.po_3)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(result.po_4)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(result.po_5)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(result.po_6)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(result.po_7)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(result.po_8)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(result.po_9)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(result.po_10)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(result.po_11)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(result.po_12)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(result.pso_1)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(result.pso_2)}</td>
                                </tr>
                              ))}
                              
                              {course.averages.map((avg, avgIndex) => (
                                <tr
                                  key={`avg-${avgIndex}`}
                                  className="bg-purple-100 font-semibold"
                                >
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-purple-800">
                                    {avg.isset === 0 ? "Set" : avg.isset === 1 ? "Target" : "Average"}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(avg.po_1)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(avg.po_2)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(avg.po_3)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(avg.po_4)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(avg.po_5)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(avg.po_6)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(avg.po_7)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(avg.po_8)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(avg.po_9)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(avg.po_10)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(avg.po_11)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(avg.po_12)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(avg.pso_1)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(avg.pso_2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                
                <div className="flex justify-center mt-8">
                  <button
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
                <div className="mx-auto h-24 w-24 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <FaLayerGroup className="text-purple-500 text-3xl" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  No courses available for the selected academic year.
                </p>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="mx-auto h-24 w-24 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <FaCalendarAlt className="text-purple-500 text-3xl" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Please select an academic year</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Select an academic year from the dropdown above to view semester-wise reports.
                </p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          {selectedYear && sortedSemesters.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex flex-wrap justify-between text-sm text-gray-600">
                <div>Academic Year: <span className="font-semibold">{selectedYear}</span></div>
                <div>Total Semesters: <span className="font-semibold">{sortedSemesters.length}</span></div>
                <div>Generated on: <span className="font-semibold">{new Date().toLocaleDateString()}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SemesterWiseReports;