import React, { useEffect, useState } from 'react';
import api from '../../../api';
import { FaGraduationCap,FaFilePdf, FaBook, FaSave, FaSpinner, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';

const MenteeDetails = ({sid}) => {
  const [isDSE, setIsDSE] = useState(false);
  const [semesters, setSemesters] = useState(Array(8).fill({ subjects: [], ktSubjects: [], sgpi: '' }));
  const [academicData, setAcademicData] = useState([]);
  const [sgpa, setSgpa] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    const fetchAcademicData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/mentormentee/get-academic-data/${sid}`);
        console.log("API Response:", response.data);

        const formattedSemesters = Array(8).fill().map(() => ({
          subjects: [],
          ktSubjects: [],
          sgpi: "",
          subjectCount: 0,
          ktCount: 0,
          pdf_path: ""
        }));

        // If data exists, populate the form
        if (response.data && response.data.length > 0) {
          // Group data by semester
          const semesterData = {};
          
          response.data.forEach((entry) => {
            const semIndex = entry.semester - 1;
            
            // Initialize semester data if not exists
            if (!semesterData[semIndex]) {
              semesterData[semIndex] = {
                subjects: [],
                ktSubjects: [],
                sgpi: entry.sgpa || "",
                subjectCount: 0,
                ktCount: 0,
                pdf_path: entry.pdf_path || ""
              };
            }
            
            // Add subject to appropriate array
            if (entry.kt === 1) {
              semesterData[semIndex].ktSubjects.push({
                subject: entry.subject || "",
                attemptNo: entry.attempt || "",
                year: entry.academic_year || "",
                ia1: entry.IA1 || "",
                ia2: entry.IA2 || "",
                tw: entry.TW || "",
                orpr: entry.ORPR || "",
                universityExam: entry.university_exam || "",
                passFail: entry.pass_fail || ""
              });
            } else {
              semesterData[semIndex].subjects.push({
                subject: entry.subject || "",
                ia1: entry.IA1 || "",
                ia2: entry.IA2 || "",
                tw: entry.TW || "",
                orpr: entry.ORPR || "",
                universityExam: entry.university_exam || "",
                passFail: entry.pass_fail || ""
              });
            }
          });
          
          // Update formatted semesters with the grouped data
          Object.keys(semesterData).forEach(semIndex => {
            formattedSemesters[semIndex] = {
              ...semesterData[semIndex],
              subjectCount: semesterData[semIndex].subjects.length,
              ktCount: semesterData[semIndex].ktSubjects.length
            };
          });
          
          showNotification('success', 'Academic data loaded successfully.');
        } else {
          // No data found
          showNotification('info', 'No existing academic data found. You can enter your information now.');
        }

        setSemesters(formattedSemesters);
      } catch (err) {
        console.error("Error fetching academic data:", err);
        // Instead of setting error, we'll just use the blank form
        const formattedSemesters = Array(8).fill().map(() => ({
          subjects: [],
          ktSubjects: [],
          sgpi: "",
          subjectCount: 0,
          ktCount: 0,
          pdf_path: ""
        }));
        setSemesters(formattedSemesters);
        // Only show notification, don't prevent form display
        showNotification('info', 'No existing academic data found. You can enter your information now.');
      } finally {
        setLoading(false);
      }
    };

    fetchAcademicData();
  }, [sid]);
  const handleFileChange = async (semIndex, event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check if file is a PDF
    if (file.type !== 'application/pdf') {
      showNotification('error', 'Please upload a PDF file');
      return;
    }
    
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('resultPdf', file);
    formData.append('semesterIndex', semIndex + 1);
    formData.append('studentId', sid);
    
    try {
      setSubmitting(true);
      const response = await api.post('/api/mentormentee/upload-result-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update the state with the new PDF path
      const updatedSemesters = [...semesters];
      updatedSemesters[semIndex].pdf_path = response.data.pdf_path;
      setSemesters(updatedSemesters);
      
      showNotification('success', 'PDF uploaded successfully!');
    } catch (error) {
      console.error('PDF upload error:', error);
      showNotification('error', 'Failed to upload PDF. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  const handleSubjectChange = (semIndex, numSubjects) => {
    const updatedSemesters = [...semesters];
    // Update the subject count
    updatedSemesters[semIndex].subjectCount = numSubjects;
    updatedSemesters[semIndex].subjects = Array.from({ length: numSubjects }, (_, i) => 
      // Preserve existing subject data if available
      i < updatedSemesters[semIndex].subjects.length 
        ? updatedSemesters[semIndex].subjects[i] 
        : { subject: '', ia1: '', ia2: '', tw: '', orpr: '', universityExam: '', passFail: '' }
    );
    setSemesters(updatedSemesters);
  };

  const handleKTChange = (semIndex, numKT) => {
    const updatedSemesters = [...semesters];
    // Update the KT count
    updatedSemesters[semIndex].ktCount = numKT;
    updatedSemesters[semIndex].ktSubjects = Array.from({ length: numKT }, (_, i) => 
      // Preserve existing KT subject data if available
      i < updatedSemesters[semIndex].ktSubjects.length 
        ? updatedSemesters[semIndex].ktSubjects[i] 
        : { subject: '', attemptNo: '', year: '', ia1: '', ia2: '', tw: '', orpr: '', universityExam: '', passFail: '' }
    );
    setSemesters(updatedSemesters);
  };

  const handleInputChange = (semIndex, type, rowIndex, field, value) => {
    const updatedSemesters = [...semesters];
  
    if (type === 'sgpi') {
      // Allow decimal input for SGPI
      if (value === '' || value === '.') {
        updatedSemesters[semIndex].sgpi = value;
      } else {
        let sgpiValue = parseFloat(value);
  
        if (!isNaN(sgpiValue) && sgpiValue >= 0 && sgpiValue <= 10) {
          // Don't format to fixed if user is still typing
          if (value.endsWith('.')) {
            updatedSemesters[semIndex].sgpi = value;
          } else {
            // Only format to 2 decimal places when value is complete
            updatedSemesters[semIndex].sgpi = sgpiValue.toString();
          }
        } else {
          updatedSemesters[semIndex].sgpi = "";
        }
      }
    } else {
      updatedSemesters[semIndex][type][rowIndex][field] = value;
    }
  
    setSemesters(updatedSemesters);
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 5000);
  };

  const handleSubmit = async (semIndex) => {
    const semesterData = semesters[semIndex];

    if (!semesterData) {
      showNotification('error', 'No data to submit!');
      return;
    }

    setSubmitting(true);
    
    try {
      const payload = {
        semesterIndex: semIndex + 1,
        subjects: semesterData.subjects,
        ktSubjects: semesterData.ktSubjects,
        sgpa: semesterData.sgpi,
        pdf_path: semesterData.pdf_path,
        isNewRecord: true  // Flag to indicate this might be a new record
      };
      
      const response = await api.post(`/api/mentormentee/submit-academic-data/${sid}`, {payload});
      showNotification('success', 'Data submitted successfully!');
    } catch (error) {
      console.error('Submission error:', error);
      showNotification('error', 'Failed to submit data. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-4xl mx-auto mb-4" />
          <p className="text-gray-700 text-lg">Loading academic data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <FaExclamationCircle className="text-red-500 text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      {/* Notification */}
            {/* Notification */}
            {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' : 
          notification.type === 'error' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'  // For 'info' notifications
        }`}>
          {notification.type === 'success' ? 
            <FaCheckCircle className="mr-2" /> : 
            notification.type === 'error' ?
            <FaExclamationCircle className="mr-2" /> :
            <FaExclamationCircle className="mr-2" />  // For 'info' notifications
          }
          <span>{notification.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <FaGraduationCap className="text-blue-600 text-4xl mr-4" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Academic Records</h1>
                <p className="text-gray-600">Manage your semester-wise academic performance</p>
              </div>
            </div>
            <div className="flex items-center">
              <label className="flex items-center space-x-2 bg-blue-50 p-3 rounded-lg cursor-pointer">
                <input 
                  type="checkbox" 
                  className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500" 
                  checked={isDSE} 
                  onChange={() => setIsDSE(!isDSE)} 
                />
                <span className="text-gray-700 font-medium">DSE Student</span>
              </label>
            </div>
          </div>
        </div>

        {/* Semester Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <div className="flex border-b">
              {semesters.map((sem, index) => (
                (!isDSE || (isDSE && index >= 2)) && (
                  <button
                    key={index}
                    className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                      activeTab === index
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveTab(index)}
                  >
                    Semester {index + 1}
                  </button>
                )
              ))}
            </div>
          </div>

          {/* Active Semester Content */}
          {semesters.map((sem, semIndex) => (
            (!isDSE || (isDSE && semIndex >= 2)) && (
              <div key={semIndex} className={`p-6 ${activeTab === semIndex ? 'block' : 'hidden'}`}>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <FaBook className="mr-2 text-blue-600" /> Regular Subjects
                  </h2>
                  
                  <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Number of Subjects:</label>
                      <input 
                        type="number" 
                        min="0" 
                        value={sem.subjectCount} 
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                        onChange={(e) => handleSubjectChange(semIndex, Number(e.target.value))} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SGPA:</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={sem.sgpi || ""}
                        onChange={(e) => handleInputChange(semIndex, 'sgpi', 0, 'sgpi', e.target.value)}
                        placeholder="0.00 - 10.00"
                      />
                    </div>
                  </div>

                  {sem.subjects.length > 0 && (
                    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IA1</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IA2</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TW</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OR/PR</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">University Exam</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pass/Fail</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {sem.subjects.map((subj, rowIndex) => (
                            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-4 py-2">
                                <input 
                                  type="text" 
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                                  value={subj.subject} 
                                  onChange={(e) => handleInputChange(semIndex, 'subjects', rowIndex, 'subject', e.target.value)} 
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input 
                                  type="number" 
                                  max="20" 
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                                  value={subj.ia1} 
                                  onChange={(e) => handleInputChange(semIndex, 'subjects', rowIndex, 'ia1', e.target.value)} 
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input 
                                  type="number" 
                                  max="20" 
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                                  value={subj.ia2} 
                                  onChange={(e) => handleInputChange(semIndex, 'subjects', rowIndex, 'ia2', e.target.value)} 
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input 
                                  type="number" 
                                  max="25" 
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                                  value={subj.tw} 
                                  onChange={(e) => handleInputChange(semIndex, 'subjects', rowIndex, 'tw', e.target.value)} 
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input 
                                  type="number" 
                                  max="50" 
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                                  value={subj.orpr} 
                                  onChange={(e) => handleInputChange(semIndex, 'subjects', rowIndex, 'orpr', e.target.value)} 
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input 
                                  type="number" 
                                  max="80" 
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                                  value={subj.universityExam} 
                                  onChange={(e) => handleInputChange(semIndex, 'subjects', rowIndex, 'universityExam', e.target.value)} 
                                />
                              </td>
                              <td className="px-4 py-2">
                                <select 
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                                  value={subj.passFail || ""} 
                                  onChange={(e) => handleInputChange(semIndex, 'subjects', rowIndex, 'passFail', e.target.value)}
                                >
                                  <option value="">Select</option>
                                  <option value="Pass">Pass</option>
                                  <option value="Fail">Fail</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* KT Subjects Section */}
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <FaBook className="mr-2 text-red-500" /> KT Subjects
                  </h2>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of KT Subjects:</label>
                    <input 
                      type="number" 
                      min="0" 
                      value={sem.ktCount} 
                      className="w-full md:w-1/3 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                      onChange={(e) => handleKTChange(semIndex, Number(e.target.value))} 
                    />
                  </div>

                  {sem.ktSubjects.length > 0 && (
                    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-red-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attempt No.</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IA1</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IA2</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TW</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OR/PR</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">University Exam</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pass/Fail</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {sem.ktSubjects.map((kt, rowIndex) => (
                            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-red-50'}>
                              <td className="px-4 py-2">
                                <input 
                                  type="text" 
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                                  value={kt.subject || ""} 
                                  onChange={(e) => handleInputChange(semIndex, 'ktSubjects', rowIndex, 'subject', e.target.value)} 
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input 
                                  type="text" 
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                                  value={kt.attemptNo || ""} 
                                  onChange={(e) => handleInputChange(semIndex, 'ktSubjects', rowIndex, 'attemptNo', e.target.value)} 
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input 
                                  type="text" 
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                                  value={kt.year || ""} 
                                  onChange={(e) => handleInputChange(semIndex, 'ktSubjects', rowIndex, 'year', e.target.value)} 
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input 
                                  type="text" 
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                                  value={kt.ia1 || ""} 
                                  onChange={(e) => handleInputChange(semIndex, 'ktSubjects', rowIndex, 'ia1', e.target.value)} 
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input 
                                  type="text" 
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                                  value={kt.ia2 || ""} 
                                  onChange={(e) => handleInputChange(semIndex, 'ktSubjects', rowIndex, 'ia2', e.target.value)} 
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input 
                                  type="text" 
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                                  value={kt.tw || ""} 
                                  onChange={(e) => handleInputChange(semIndex, 'ktSubjects', rowIndex, 'tw', e.target.value)} 
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input 
                                  type="text" 
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                                  value={kt.orpr || ""} 
                                  onChange={(e) => handleInputChange(semIndex, 'ktSubjects', rowIndex, 'orpr', e.target.value)} 
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input 
                                  type="text" 
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                                  value={kt.universityExam || ""} 
                                  onChange={(e) => handleInputChange(semIndex, 'ktSubjects', rowIndex, 'universityExam', e.target.value)} 
                                />
                              </td>
                              <td className="px-4 py-2">
                                <select 
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                                  value={kt.passFail || ""} 
                                  onChange={(e) => handleInputChange(semIndex, 'ktSubjects', rowIndex, 'passFail', e.target.value)}
                                >
                                  <option value="">Select</option>
                                  <option value="Pass">Pass</option>
                                  <option value="Fail">Fail</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="mt-8 flex justify-end">
                  <button 
                    onClick={() => handleSubmit(semIndex)} 
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2" />
                        Save Semester Data
                      </>
                    )}
                  </button>
                </div>
          
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MenteeDetails;
