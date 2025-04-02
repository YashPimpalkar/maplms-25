import React, { useEffect, useState } from "react";
import api from "../../../api.js";
import FormData from "form-data";
import { backend_url as backendUrl } from "../../../api.js";
import { FaPlus, FaDownload, FaEye, FaTrash, FaSpinner, FaCertificate, FaCalendarAlt, FaFileAlt, FaInfoCircle } from "react-icons/fa";
import { motion } from "framer-motion";

const MenteeCertification = ({ sid }) => {
  const [certifications, setCertifications] = useState([]);
  const [certificationData, setCertificationData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    fetchCertificationData();
  }, []);

  const fetchCertificationData = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/api/mentormentee/mentee/get-certifications/${sid}`
      );
      setCertificationData(response.data);
    } catch (error) {
      console.error("Error fetching certification data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCertification = () => {
    setCertifications([
      ...certifications,
      {
        semester: "1",
        name: "",
        description: "",
        completionDate: "",
        file: null,
      },
    ]);
  };

  const handleInputChange = (index, field, value) => {
    const updatedCertifications = [...certifications];
    updatedCertifications[index][field] = value;
    setCertifications(updatedCertifications);
  };

  const handleFileUpload = (index, file) => {
    if (file && file.type === "application/pdf") {
      const updatedCertifications = [...certifications];
      updatedCertifications[index].file = file;
      setCertifications(updatedCertifications);
    } else {
      alert("Only PDF files are allowed!");
    }
  };

  const handleRemoveCertification = (index) => {
    const updatedCertifications = [...certifications];
    updatedCertifications.splice(index, 1);
    setCertifications(updatedCertifications);
  };

  const handleDeleteCertification = async (certId) => {
    if (!window.confirm("Are you sure you want to delete this certification?")) {
      return;
    }
    
    try {
      setDeleteLoading(certId);
      await api.delete(`/api/mentormentee/mentee/delete-certification/${certId}`);
      fetchCertificationData();
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Failed to delete certification");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSubmit = async () => {
    if (!certifications.length) return;
    
    // Validate form
    for (const cert of certifications) {
      if (!cert.name || !cert.description || !cert.completionDate || !cert.file) {
        alert("Please fill all fields and upload a certificate file");
        return;
      }
    }
    
    const formData = new FormData();

    certifications.forEach((certification) => {
      formData.append("student_id", sid);
      formData.append("semester", certification.semester);
      formData.append("certificateName", certification.name);
      formData.append("description", certification.description);
      formData.append("completionDate", certification.completionDate);
      if (certification.file) formData.append("file", certification.file);
    });

    try {
      setSubmitting(true);
      await api.post(
        `/api/mentormentee/mentee/upload-certifications/${sid}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      // Show success message
      const successMessage = document.createElement("div");
      successMessage.className = "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50";
      successMessage.textContent = "Certification data submitted successfully!";
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
      
      setCertifications([]);
      fetchCertificationData();
    } catch (error) {
      console.error("Submit Error:", error);
      alert("Failed to submit certification data");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadCertificate = (filePath) => {
    const downloadUrl = `${backendUrl}/api/mentormentee/mentee/certifications/download${filePath}`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", filePath.split("/").pop());
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenCertificationFile = (filePath) => {
    if (!filePath) {
      console.error("File path is missing!");
      return;
    }

    // Construct the full URL
    const fileUrl = `${backendUrl}/api/mentormentee/mentee/certifications/download${filePath}`;
    window.open(fileUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-10 mt-5">
          {/* <div className="inline-block p-3 rounded-full bg-blue-100 mb-4">
            <FaCertificate className="w-10 h-10 text-blue-600" />
          </div> */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            My Certifications
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Manage your certifications and achievements to showcase your skills and knowledge
          </p>
        </div>

        {/* Existing Certifications */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">
              Your Certifications
            </h2>
            <button
              onClick={handleAddCertification}
              className="flex items-center px-4 py-2 bg-white text-blue-700 rounded-md hover:bg-blue-50 transition-colors duration-200 font-medium"
            >
              <FaPlus className="mr-2" /> Add New
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center p-12">
              <FaSpinner className="animate-spin text-blue-500 text-4xl" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-6 py-3 text-gray-500 font-medium">Semester</th>
                    <th className="px-6 py-3 text-gray-500 font-medium">Certificate Name</th>
                    <th className="px-6 py-3 text-gray-500 font-medium">Description</th>
                    <th className="px-6 py-3 text-gray-500 font-medium">Completion Date</th>
                    <th className="px-6 py-3 text-gray-500 font-medium text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {certificationData.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center p-8 text-gray-500">
                        <div className="flex flex-col items-center">
                          <FaInfoCircle className="text-gray-400 text-4xl mb-2" />
                          <p>No certifications found. Add your first certification!</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    certificationData.map((certification, index) => (
                      <tr
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`hover:bg-blue-50 transition-colors duration-150`}
                      >
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {certification.semester}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {certification.certificate_name}
                        </td>
                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                          {certification.description}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          <div className="flex items-center">
                            <FaCalendarAlt className="text-gray-400 mr-2" />
                            {new Date(certification.completion_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center space-x-2">
                            {certification.file_path ? (
                              <>
                                <button
                                  onClick={() => handleDownloadCertificate(certification.file_path)}
                                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                                  title="Download"
                                >
                                  <FaDownload />
                                </button>
                                <button
                                  onClick={() => handleOpenCertificationFile(certification.file_path)}
                                  className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                                  title="View"
                                >
                                  <FaEye />
                                </button>
                                <button
                                  onClick={() => handleDeleteCertification(certification.id)}
                                  className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                                  title="Delete"
                                  disabled={deleteLoading === certification.id}
                                >
                                  {deleteLoading === certification.id ? (
                                    <FaSpinner className="animate-spin" />
                                  ) : (
                                    <FaTrash />
                                  )}
                                </button>
                              </>
                            ) : (
                              <span className="text-gray-500">No File</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add New Certifications Form */}
        {certifications.length > 0 && (
          <div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md overflow-hidden mb-8"
          >
            <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-green-700">
              <h2 className="text-xl font-bold text-white">
                Add New Certifications
              </h2>
            </div>
            <div className="p-6">
              {certifications.map((certification, index) => (
                <div 
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="mb-6 p-6 border border-gray-200 rounded-lg bg-gray-50 relative"
                >
                  <button
                    onClick={() => handleRemoveCertification(index)}
                    className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                    title="Remove"
                  >
                    <FaTrash />
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Semester
                      </label>
                      <select
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        value={certification.semester}
                        onChange={(e) => handleInputChange(index, "semester", e.target.value)}
                      >
                        {[...Array(8).keys()].map((num) => (
                          <option key={num + 1} value={num + 1}>
                            Semester {num + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Certificate Name
                      </label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        value={certification.name}
                        onChange={(e) => handleInputChange(index, "name", e.target.value)}
                        placeholder="e.g. AWS Certified Solutions Architect"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        value={certification.description}
                        onChange={(e) => handleInputChange(index, "description", e.target.value)}
                        rows="3"
                        placeholder="Brief description of the certification and skills gained"
                      ></textarea>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Completion Date
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaCalendarAlt className="text-gray-400" />
                        </div>
                        <input
                          type="date"
                          className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={certification.completionDate}
                          onChange={(e) => handleInputChange(index, "completionDate", e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload Certificate (PDF only)
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                        <div className="space-y-1 text-center">
                          <FaFileAlt className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label htmlFor={`file-upload-${index}`} className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                              <span>Upload a file</span>
                              <input 
                                id={`file-upload-${index}`} 
                                name="file-upload" 
                                type="file"
                                accept="application/pdf"
                                className="sr-only"
                                onChange={(e) => handleFileUpload(index, e.target.files[0])}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PDF up to 10MB</p>
                        </div>
                      </div>
                      {certification.file && (
                        <div className="mt-2 flex items-center text-sm text-green-600">
                          <FaFileAlt className="mr-2" />
                          File uploaded: {certification.file.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Save Certifications
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Add Button (when no forms are visible) */}
        {certifications.length === 0 && (
          <div className="flex justify-center">
            <button
              onClick={handleAddCertification}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
            >
              <FaPlus className="mr-2" /> Add New Certification
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenteeCertification;