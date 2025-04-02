import React, { useEffect, useState, useRef } from "react";
import api from "../../../api";
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { FaCalendarAlt, FaSpinner, FaFilePdf, FaTable, FaBullseye, FaChartLine } from "react-icons/fa";
import { motion } from "framer-motion";

const SetTargetReports = ({uid}) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [selectedYear, setSelectedYear] = useState("");
    const [activeTab, setActiveTab] = useState(""); // Tracks the active tab
    let [tabData, setTabData] = useState([]);
    const [tabLoading, setTabLoading] = useState(false);
    const [pdfGenerating, setPdfGenerating] = useState(false);
    const tableRefs = useRef([]);
    
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
  
    const handleYearChange = (event) => {
      setSelectedYear(event.target.value);
      setActiveTab(""); // Reset active tab when a new year is selected
      setTabData([]); // Clear previous tab data
    };
  
    const handleTabClick = async (tab) => {
      setActiveTab(tab);
      try {
        setTabLoading(true);
        const res = await api.get(`/api/reports/coursewise/${tab}/${uid}`, {
          params: { selectedYear }, // Pass the selectedYear as query params
        });
        setTabData(res.data);
      } catch (err) {
        console.error(`Error fetching ${tab} data:`, err);
      } finally {
        setTabLoading(false);
      }
    };
  
    const addToRefs = (el) => {
      if (el && !tableRefs.current.includes(el)) {
        tableRefs.current.push(el);
      }
    };
    
    const generatePDF = async () => {
      setPdfGenerating(true);
      const pdf = new jsPDF();
      const pageHeight = pdf.internal.pageSize.height; // Page height in mm
      const pageWidth = pdf.internal.pageSize.width; // Page width in mm
    
      // Header image from public folder
      const collegeHeader = '/images/CollegeHeader.png';
    
      let yPosition = 20; // Initial Y position after the header
      let isFirstTable = true; // Flag to check if it's the first table
      pdf.setFontSize(14);
      pdf.setTextColor(128, 0, 128); // Purple color for the text
      pdf.text(`${activeTab.toUpperCase()} Report - Academic Year: ${selectedYear}`, pageWidth / 2, yPosition + 25, { align: 'center' });

      yPosition += 10; // Move down after the heading
      for (const table of tableRefs.current) {
        if (table) {
          // Add header image
          const headerImage = new Image();
          headerImage.src = collegeHeader;
    
          // Wait for the header image to load
          await new Promise((resolve) => {
            headerImage.onload = resolve;
          });
    
          // Add the header image to the PDF
          pdf.addImage(headerImage, 'PNG', 10, 10, pageWidth - 20, 20);
    
          // Adjust position for the first table
          if (isFirstTable) {
            yPosition += 20; // Move down after header
            isFirstTable = false;
          }
    
          // Get table rows and thead separately
          const thead = table.querySelector('thead');
          const rows = table.querySelectorAll('tbody tr');
    
          // Capture thead as an image
          if (thead) {
            const canvas = await html2canvas(thead);
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = pageWidth - 20;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
            // Add thead image to the PDF
            pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight; // Update Y position after thead
          }
    
          // Calculate row height (approximate)
          const rowHeight = 10;
    
          for (const row of rows) {
            // If adding the next row will exceed the page height, add a new page
            if (yPosition + rowHeight > pageHeight - 20) {
              pdf.addPage();
              yPosition = 20; // Reset Y position for new page
    
              // Re-add header image to the new page
              pdf.addImage(headerImage, 'PNG', 10, 10, pageWidth - 20, 20);
              yPosition += 20; // Move down after header
    
              // Re-add the thead on the new page
              if (thead) {
                const canvas = await html2canvas(thead);
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = pageWidth - 20;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
                yPosition += imgHeight; // Update Y position after thead
              }
            }
    
            // Capture row as an image
            const canvas = await html2canvas(row);
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = pageWidth - 20;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
            // Add row image to the PDF
            pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight; // Update Y position for next row
          }
    
          // Add some space between tables
          yPosition += 10;
        }
      }
    
      // Save the PDF
      pdf.save(`${activeTab}_report_${selectedYear}.pdf`);
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
  
    return (
      <div 
        className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="h-16 w-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-4">
                    <FaChartLine className="text-white text-3xl" />
                  </div>
                  <h1 className="text-2xl font-bold text-white">
                    Set/Target Reports
                  </h1>
                </div>
                
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" />
                  <select
                    id="academicYear"
                    value={selectedYear}
                    onChange={handleYearChange}
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

            {/* Tab Navigation */}
            {selectedYear && (
              <div className="px-6 pt-4 border-b border-gray-200">
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleTabClick("set")}
                    className={`flex items-center px-4 py-2 rounded-t-lg font-medium transition-colors ${
                      activeTab === "set"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <FaTable className="mr-2" />
                    Set
                  </button>
                  
                  <button
                    onClick={() => handleTabClick("target")}
                    className={`flex items-center px-4 py-2 rounded-t-lg font-medium transition-colors ${
                      activeTab === "target"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <FaBullseye className="mr-2" />
                    Target
                  </button>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <FaSpinner className="animate-spin text-purple-500 text-4xl" />
                </div>
              ) : !selectedYear ? (
                <div className="text-center py-20">
                  <div className="mx-auto h-24 w-24 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                    <FaCalendarAlt className="text-purple-500 text-3xl" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Please select an academic year</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Select an academic year from the dropdown above to view set/target reports.
                  </p>
                </div>
              ) : !activeTab ? (
                <div className="text-center py-20">
                  <div className="mx-auto h-24 w-24 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                    <FaChartLine className="text-purple-500 text-3xl" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Please select a report type</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Choose either "Set" or "Target" from the tabs above to view the corresponding report.
                  </p>
                </div>
              ) : tabLoading ? (
                <div className="flex justify-center items-center py-20">
                  <FaSpinner className="animate-spin text-purple-500 text-4xl mr-3" />
                  <span className="text-lg text-gray-700">Loading {activeTab} data...</span>
                </div>
              ) : tabData.length > 0 ? (
                <div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-purple-50 p-4 rounded-lg mb-6 border border-purple-200">
                    <h2 className="text-xl font-bold text-center text-purple-900 mb-4">
                      3.1.3 Program Level Course-PO Matrix of All Courses INCLUDING First Year Courses (10) {selectedYear}
                    </h2>
                    <p className="text-sm text-center text-gray-700 mb-4">
                      Following table shows the details of Program Level Course-PO Matrix of all courses including first year courses.
                    </p>
                    <div className="flex flex-wrap justify-center gap-6 text-sm">
                      <div className="bg-white p-2 rounded-lg shadow-sm">
                        <p className="font-medium text-purple-800 mb-1">Correlation Levels:</p>
                        <ul className="space-y-1">
                          <li className="flex items-center">
                            <span className="w-4 h-4 rounded-full bg-orange-500 mr-2"></span>
                            <span><strong>1:</strong> Slight (Low)</span>
                          </li>
                          <li className="flex items-center">
                            <span className="w-4 h-4 rounded-full bg-blue-600 mr-2"></span>
                            <span><strong>2:</strong> Moderate (Medium)</span>
                          </li>
                          <li className="flex items-center">
                            <span className="w-4 h-4 rounded-full bg-green-600 mr-2"></span>
                            <span><strong>3:</strong> Substantial (High)</span>
                          </li>
                          <li className="flex items-center">
                            <span className="w-4 h-4 rounded-full bg-gray-300 mr-2"></span>
                            <span><strong>-:</strong> No correlation</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200" ref={addToRefs}>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Sr No</th>
                          <th className="px-4 py-3 text-left text-xs font-medium                           uppercase tracking-wider">Course Code</th>
                          <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">PO1</th>
                          <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">PO2</th>
                          <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">PO3</th>
                          <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">PO4</th>
                          <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">PO5</th>
                          <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">PO6</th>
                          <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">PO7</th>
                          <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">PO8</th>
                          <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">PO9</th>
                          <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">PO10</th>
                          <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">PO11</th>
                          <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">PO12</th>
                          <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">PSO1</th>
                          <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">PSO2</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tabData.map((item, rowIndex) => (
                          <tr 
                            key={rowIndex} 
                            className={rowIndex % 2 === 0 ? "bg-white" : "bg-purple-50"}
                          >
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{rowIndex + 1}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-purple-800">{item.coursecode || "-"}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(item.po_1)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(item.po_2)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(item.po_3)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(item.po_4)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(item.po_5)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(item.po_6)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(item.po_7)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(item.po_8)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(item.po_9)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(item.po_10)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(item.po_11)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(item.po_12)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(item.pso_1)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{renderPOValue(item.pso_2)}</td>
                          </tr>
                        ))}
                        
                        <tr className="bg-purple-100 font-semibold">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-purple-800 text-center" colSpan={2}>
                            Average
                          </td>
                          {[...Array(12)].map((_, i) => {
                            // Filter out invalid values
                            const validValues = tabData
                              .map((item) => parseFloat(item[`po_${i + 1}`]))
                              .filter((val) => !isNaN(val) && val !== 0);

                            const avg = validValues.length > 0 
                              ? validValues.reduce((sum, val) => sum + val, 0) / validValues.length 
                              : "-";

                            return (
                              <td key={i} className="px-4 py-3 whitespace-nowrap text-sm text-center font-medium">
                                {avg !== "-" ? renderPOValue(avg.toFixed(2)) : "-"}
                              </td>
                            );
                          })}
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-medium">
                            {(() => {
                              const validValues = tabData
                                .map((item) => parseFloat(item.pso_1))
                                .filter((val) => !isNaN(val) && val !== 0);

                              const avg = validValues.length > 0 
                                ? (validValues.reduce((sum, val) => sum + val, 0) / validValues.length).toFixed(2)
                                : "-";
                                
                              return renderPOValue(avg);
                            })()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-medium">
                            {(() => {
                              const validValues = tabData
                                .map((item) => parseFloat(item.pso_2))
                                .filter((val) => !isNaN(val) && val !== 0);

                              const avg = validValues.length > 0 
                                ? (validValues.reduce((sum, val) => sum + val, 0) / validValues.length).toFixed(2)
                                : "-";
                                
                              return renderPOValue(avg);
                            })()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
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
              ) : (
                <div className="text-center py-10">
                  <div className="mx-auto h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                    <FaTable className="text-purple-500 text-xl" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
                  <p className="text-gray-500">There is no {activeTab} data available for the selected academic year.</p>
                </div>
              )}
            </div>
            
            {/* Footer */}
            {activeTab && tabData.length > 0 && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex flex-wrap justify-between text-sm text-gray-600">
                  <div>Report Type: <span className="font-semibold capitalize">{activeTab}</span></div>
                  <div>Academic Year: <span className="font-semibold">{selectedYear}</span></div>
                  <div>Generated on: <span className="font-semibold">{new Date().toLocaleDateString()}</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
};

export default SetTargetReports;