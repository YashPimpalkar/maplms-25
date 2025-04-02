import React, { useEffect, useState } from "react";
import api from "../../../api.js";
import FormData from "form-data";
import { backend_url as backendUrl } from "../../../api.js";
import { FaBriefcase, FaBuilding, FaCalendarAlt, FaDownload, FaEye, FaPlus, FaTrash, FaSave, FaFileUpload, FaCheck } from "react-icons/fa";
// ... rest of the code remains unchanged
const MenteeInternships = ({ sid }) => {
  const [internships, setInternships] = useState([]);
  const [internshipData, setInternshipData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInternshipData();
  }, []);

  const fetchInternshipData = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/api/mentormentee/mentee/get-internships/${sid}`
      );
      setInternshipData(response.data);
    } catch (error) {
      console.error("Error fetching internship data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInternship = () => {
    setInternships([
      ...internships,
      {
        semester: "1",
        company: "",
        jobRole: "",
        description: "",
        from: "",
        to: "",
        duration: "",
        file: null,
      },
    ]);
  };

  const handleRemoveInternship = (index) => {
    const updatedInternships = [...internships];
    updatedInternships.splice(index, 1);
    setInternships(updatedInternships);
  };

  const handleInputChange = (index, field, value) => {
    const updatedInternships = [...internships];
    updatedInternships[index][field] = value;

    // Auto-calculate duration if dates are selected
    if (field === "from" || field === "to") {
      const fromDate = new Date(updatedInternships[index].from);
      const toDate = new Date(updatedInternships[index].to);
      if (!isNaN(fromDate) && !isNaN(toDate) && fromDate <= toDate) {
        const diffInMonths =
          (toDate.getFullYear() - fromDate.getFullYear()) * 12 +
          (toDate.getMonth() - fromDate.getMonth());
        updatedInternships[index].duration = `${diffInMonths + 1} month(s)`;
      } else {
        updatedInternships[index].duration = "";
      }
    }

    setInternships(updatedInternships);
  };

  const handleFileUpload = (index, file) => {
    if (file && file.type === "application/pdf") {
      const updatedInternships = [...internships];
      updatedInternships[index].file = file;
      setInternships(updatedInternships);
    } else {
      alert("Only PDF files are allowed!");
    }
  };

  const handleSubmit = async () => {
    // Validate form
    for (const internship of internships) {
      if (!internship.company || !internship.jobRole || !internship.from || !internship.to) {
        alert("Please fill in all required fields (Company, Job Role, From Date, To Date)");
        return;
      }
    }

    setSubmitting(true);
    const formData = new FormData();

    internships.forEach((internship) => {
      formData.append("student_id", sid);
      formData.append("semester", internship.semester);
      formData.append("company", internship.company);
      formData.append("jobRole", internship.jobRole);
      formData.append("description", internship.description);
      formData.append("from", internship.from);
      formData.append("to", internship.to);
      formData.append("duration", internship.duration);
      if (internship.file) formData.append("file", internship.file);
    });

    try {
      const response = await api.post(
        `/api/mentormentee/mentee/upload-internships/${sid}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      alert("Internship data submitted successfully!");
      setInternships([]);
      fetchInternshipData(); // Refresh the list
    } catch (error) {
      console.error("Submit Error:", error);
      alert("Failed to submit internship data");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadInternship = (filePath) => {
    const downloadUrl = `${backendUrl}/api/mentormentee/mentee/internships/download/${filePath}`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", filePath.split("/").pop());
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInternshipFile = (filePath) => {
    if (!filePath) {
      console.error("File path is missing!");
      return;
    }
    const fileUrl = `${backendUrl}/api/mentormentee/mentee/internships/download${filePath}`;
    window.open(fileUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 mt-5">
          {/* <div className="inline-block p-3 rounded-full bg-blue-100 text-blue-600 mb-4">
            <FaBriefcase className="text-3xl" />
          </div> */}
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Internship Records</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Track and manage your professional experiences and internships throughout your academic journey.
          </p>
        </div>

        {/* Internship List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-700">
            <h2 className="text-xl font-bold text-white flex items-center">
              <FaBriefcase className="mr-2" /> Your Internship History
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Semester</th>
                    <th className="px-6 py-3">Company</th>
                    <th className="px-6 py-3">Job Role</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">Period</th>
                    <th className="px-6 py-3">Duration</th>
                    <th className="px-6 py-3">Certificate</th>
                    <th className="px-6 py-3">Date Added</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {internshipData.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <FaBriefcase className="text-gray-300 text-4xl mb-3" />
                          <p className="text-lg font-medium">No internships recorded yet</p>
                          <p className="text-sm text-gray-400 mt-1">Add your first internship using the form below</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    internshipData.map((internship, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            Sem {internship.semester}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <FaBuilding className="text-gray-500" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{internship.company_name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{internship.job_role}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 max-w-xs truncate">{internship.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <FaCalendarAlt className="mr-1 text-gray-400" />
                            <span>
                              {new Date(internship.from_date).toLocaleDateString()} - {new Date(internship.to_date).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            {internship.duration}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {internship.file_path ? (
                            <div className="flex space-x-2 justify-center">
                              <button
                                onClick={() => handleDownloadInternship(internship.file_path)}
                                className="p-1.5 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                                title="Download Certificate"
                              >
                                <FaDownload />
                              </button>
                              <button
                                onClick={() => handleOpenInternshipFile(internship.file_path)}
                                className="p-1.5 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                                title="View Certificate"
                              >
                                <FaEye />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">No File</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(internship.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add New Internship Form */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-teal-600">
            <h2 className="text-xl font-bold text-white flex items-center">
              <FaPlus className="mr-2" /> Add New Internship
            </h2>
          </div>

          <div className="p-6">
            {internships.map((internship, index) => (
              <div key={index} className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200 relative">
                <button
                  onClick={() => handleRemoveInternship(index)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove internship"
                >
                  <FaTrash />
                </button>
                
                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2">
                    #{index + 1}
                  </span>
                  Internship Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div>
                    {/* Semester Dropdown */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                      <select
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={internship.semester}
                        onChange={(e) => handleInputChange(index, "semester", e.target.value)}
                      >
                        {[...Array(8).keys()].map((num) => (
                          <option key={num + 1} value={num + 1}>
                            Semester {num + 1}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Company Name */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaBuilding className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          className="w-full pl-10 p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          value={internship.company}
                          onChange={(                        e) => handleInputChange(index, "company", e.target.value)
                          }
                          placeholder="Enter company name"
                          required
                        />
                      </div>
                    </div>
    
                    {/* Job Role */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Job Role <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={internship.jobRole}
                        onChange={(e) => handleInputChange(index, "jobRole", e.target.value)}
                        placeholder="Enter job role or position"
                        required
                      />
                    </div>
    
                    {/* Description */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={internship.description}
                        onChange={(e) => handleInputChange(index, "description", e.target.value)}
                        placeholder="Describe your responsibilities and achievements"
                        rows="3"
                      ></textarea>
                    </div>
                  </div>
    
                  {/* Right Column */}
                  <div>
                    {/* Date Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          From Date <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaCalendarAlt className="text-gray-400" />
                          </div>
                          <input
                            type="date"
                            className="w-full pl-10 p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            value={internship.from}
                            onChange={(e) => handleInputChange(index, "from", e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          To Date <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaCalendarAlt className="text-gray-400" />
                          </div>
                          <input
                            type="date"
                            className="w-full pl-10 p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            value={internship.to}
                            onChange={(e) => handleInputChange(index, "to", e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
    
                    {/* Duration (Auto-Calculated) */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration (Auto-calculated)
                      </label>
                      <input
                        type="text"
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-500"
                        value={internship.duration}
                        readOnly
                      />
                    </div>
    
                    {/* Upload Certificate */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload Certificate (PDF only)
                      </label>
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FaFileUpload className="w-8 h-8 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PDF only (MAX. 5MB)</p>
                          </div>
                          <input
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) => handleFileUpload(index, e.target.files[0])}
                          />
                        </label>
                      </div>
                      {internship.file && (
                        <p className="text-sm text-green-600 mt-2 flex items-center">
                          <FaCheck className="mr-1" /> File uploaded: {internship.file.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
    
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mt-6">
              <button
                type="button"
                onClick={handleAddInternship}
                className="px-5 py-2.5 bg-blue-100 text-blue-700 font-medium rounded-lg hover:bg-blue-200 focus:ring-4 focus:ring-blue-300 transition-colors flex items-center"
              >
                <FaPlus className="mr-2" /> Add Another Internship
              </button>
              
              {internships.length > 0 && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={`px-5 py-2.5 font-medium rounded-lg text-white flex items-center ${
                    submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300'
                  } transition-colors`}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" /> Save All Internships
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Add animation styles */}
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
          }
        `}</style>
      </div>
    </div>
    );
}; 
export default MenteeInternships;