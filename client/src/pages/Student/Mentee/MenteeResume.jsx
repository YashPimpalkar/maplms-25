import React, { useEffect, useState } from "react";
import api from "../../../api.js";
import FormData from "form-data";
import { backend_url as backendUrl } from "../../../api.js";
import {
  FaFileAlt,
  FaDownload,
  FaEye,
  FaPlus,
  FaTrash,
  FaSpinner,
  FaBriefcase,
} from "react-icons/fa";

const MenteeResume = ({ sid }) => {
  const [resumes, setResumes] = useState([]);
  const [resumeData, setResumeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchResumeData();
  }, []);

  const fetchResumeData = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/api/mentormentee/mentee/get-resumes/${sid}`
      );
      setResumeData(response.data);
    } catch (error) {
      console.error("Error fetching resume data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddResume = () => {
    setResumes([
      ...resumes,
      {
        jobRole: "",
        description: "",
        file: null,
      },
    ]);
    setShowForm(true);
  };

  const handleRemoveResume = (index) => {
    const updatedResumes = [...resumes];
    updatedResumes.splice(index, 1);
    setResumes(updatedResumes);
    if (updatedResumes.length === 0) {
      setShowForm(false);
    }
  };

  const handleInputChange = (index, field, value) => {
    const updatedResumes = [...resumes];
    updatedResumes[index][field] = value;
    setResumes(updatedResumes);
  };

  const handleFileUpload = (index, file) => {
    if (file && file.type === "application/pdf") {
      const updatedResumes = [...resumes];
      updatedResumes[index].file = file;
      setResumes(updatedResumes);
    } else {
      alert("Only PDF files are allowed!");
    }
  };

  const handleSubmit = async () => {
    // Validate form
    const hasEmptyFields = resumes.some(
      (resume) => !resume.jobRole || !resume.description || !resume.file
    );

    if (hasEmptyFields) {
      alert("Please fill all fields and upload a resume file for each entry.");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    resumes.forEach((resume) => {
      formData.append("student_id", sid);
      formData.append("jobRole", resume.jobRole);
      formData.append("description", resume.description);
      if (resume.file) formData.append("file", resume.file);
    });

    try {
      await api.post(
        `/api/mentormentee/mentee/upload-resume/${sid}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      alert("Resume data submitted successfully!");
      setResumes([]);
      setShowForm(false);
      fetchResumeData();
    } catch (error) {
      console.error("Submit Error:", error);
      alert("Failed to submit resume data");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadResume = (resumePath) => {
    const downloadUrl = `${backendUrl}/api/mentormentee/mentee/resumes/download${resumePath}`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", resumePath.split("/").pop());
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenResumeFile = (resumePath) => {
    if (!resumePath) {
      console.error("Resume path is missing!");
      return;
    }
    const fileUrl = `${backendUrl}/api/mentormentee/mentee/resumes/download${resumePath}`;
    window.open(fileUrl, "_blank");
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg h-screen">
      <div
      >
        <div className="flex items-center justify-center mb-8 mt-8">
          <FaBriefcase className="text-blue-600 text-3xl mr-3" />
          <h2 className="text-3xl font-bold text-blue-800 tracking-tight">
            My Resumes
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <FaSpinner className="animate-spin text-blue-600 text-4xl" />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            {resumeData.length === 0 ? (
              <div className="p-8 text-center">
                <FaFileAlt className="mx-auto text-gray-300 text-5xl mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  No resumes yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Upload your first resume to get feedback from your mentor
                </p>
                <button
                  onClick={handleAddResume}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaPlus className="mr-2" /> Add Your First Resume
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      <th className="py-3 px-4 text-left font-semibold">
                        Job Role
                      </th>
                      <th className="py-3 px-4 text-left font-semibold">
                        Description
                      </th>
                      <th className="py-3 px-4 text-center font-semibold">
                        Resume
                      </th>
                      <th className="py-3 px-4 text-center font-semibold">
                        Uploaded On
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumeData.map((resume, index) => (
                      <tr
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`border-b ${
                          index % 2 === 0 ? "bg-gray-50" : "bg-white"
                        } hover:bg-blue-50 transition-colors`}
                      >
                        <td className="py-3 px-4 font-medium text-gray-800">
                          {resume.job_role}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {resume.description}
                        </td>
                        <td className="py-3 px-4">
                          {resume.resume_path ? (
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() =>
                                  handleDownloadResume(resume.resume_path)
                                }
                                className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                                title="Download Resume"
                              >
                                <FaDownload />
                              </button>
                              <button
                                onClick={() =>
                                  handleOpenResumeFile(resume.resume_path)
                                }
                                className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                                title="View Resume"
                              >
                                <FaEye />
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">
                              No file
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-600">
                          {formatDate(resume.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Add Resume Button */}
        {!showForm && resumeData.length > 0 && (
          <div className="flex justify-end mb-6">
            <button
              onClick={handleAddResume}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <FaPlus className="mr-2" /> Add New Resume
            </button>
          </div>
        )}

        {/* Resume Form */}
        {showForm && (
          <div
            className="bg-white rounded-xl shadow-md p-6 mb-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {resumes.length > 1 ? "Add New Resumes" : "Add New Resume"}
            </h3>

            <div className="space-y-6">
              {resumes.map((resume, index) => (
                <div
                  className="p-4 border border-gray-200 rounded-lg relative"
                >
                  <button
                    onClick={() => handleRemoveResume(index)}
                    className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 transition-colors"
                    title="Remove"
                  >
                    <FaTrash />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Job Role
                      </label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="e.g. Software Engineer, Data Analyst"
                        value={resume.jobRole}
                        onChange={(e) =>
                          handleInputChange(index, "jobRole", e.target.value)
                        }
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Brief description of the job role and your qualifications"
                        value={resume.description}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        rows="3"
                      ></textarea>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload Resume (PDF only)
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                        <div className="space-y-1 text-center">
                          <FaFileAlt className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor={`file-upload-${index}`}
                              className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                            >
                              <span>Upload a file</span>
                              <input
                                id={`file-upload-${index}`}
                                name="file-upload"
                                type="file"
                                accept="application/pdf"
                                className="sr-only"
                                onChange={(e) =>
                                  handleFileUpload(index, e.target.files[0])
                                }
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            PDF up to 10MB
                          </p>
                        </div>
                      </div>
                      {resume.file && (
                        <div className="mt-2 flex items-center text-sm text-green-600">
                          <FaFileAlt className="mr-2" />
                          File uploaded: {resume.file.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex flex-wrap gap-4 justify-between mt-6">
                <button
                  onClick={handleAddResume}
                  className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <FaPlus className="mr-2" /> Add Another Resume
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    "Save Resumes"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenteeResume;
