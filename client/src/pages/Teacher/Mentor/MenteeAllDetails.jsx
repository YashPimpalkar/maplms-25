import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../../api";
import { backend_url as backendUrl } from "../../../api.js";
import {
  FaArrowLeft,
  FaDownload,
  FaEye,
  FaUserGraduate,
  FaBriefcase,
  FaCertificate,
  FaFileAlt,
  FaSpinner,
} from "react-icons/fa";

const MenteeAllDetails = () => {
  const { mmr_id, sid } = useParams();
  const navigate = useNavigate();
  const [performanceData, setPerformanceData] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: "profile", label: "Profile", icon: <FaUserGraduate /> },
    { id: "results", label: "Semester Results", icon: <FaFileAlt /> },
    { id: "internships", label: "Internships", icon: <FaBriefcase /> },
    { id: "certifications", label: "Certifications", icon: <FaCertificate /> },
    { id: "marksheets", label: "Marksheets", icon: <FaCertificate /> },
    { id: "resume", label: "Resume", icon: <FaFileAlt /> },
  ];

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const response = await api.get(
          `/api/mentor/get-student-profile/${sid}`
        );
        console.log(response.data.profile);
        setStudentProfile(response.data.profile);
      } catch (error) {
        console.error("Error fetching student profile:", error);
      }
    };

    fetchStudentProfile();
  }, [sid]);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/api/mentor/get-performance/${sid}`)
      .then((response) => {
        setPerformanceData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, [sid]);

  const [internshipData, setInternshipData] = useState([]);

  useEffect(() => {
    fetchInternshipData();
  }, []);

  const fetchInternshipData = async () => {
    try {
      const response = await api.get(`/api/mentor/get-internships/${sid}`);
      setInternshipData(response.data);
    } catch (error) {
      console.error("Error fetching internship data:", error);
    }
  };

  const [certificationData, setCertificationData] = useState([]);

  useEffect(() => {
    fetchCertificationData();
  }, []);

  const fetchCertificationData = async () => {
    try {
      const response = await api.get(`/api/mentor/get-certifications/${sid}`);
      setCertificationData(response.data);
    } catch (error) {
      console.error("Error fetching certification data:", error);
    }
  };

  const [marksheetData, setMarksheetData] = useState([]);

useEffect(() => {
  fetchMarksheetData();
}, []);

const fetchMarksheetData = async () => {
  try {
    const response = await api.get(`/api/mentor/get-marksheets/${sid}`);
    setMarksheetData(response.data);
  } catch (error) {
    console.error("Error fetching marksheet data:", error);
  }
};

  const [resumeData, setResumeData] = useState([]);

  useEffect(() => {
    fetchResumeData();
  }, []);

  const fetchResumeData = async () => {
    try {
      const response = await api.get(`/api/mentor/get-resumes/${sid}`);
      setResumeData(response.data);
    } catch (error) {
      console.error("Error fetching resume data:", error);
    }
  };

  const handleDownloadResume = (resumePath) => {
    const downloadUrl = `${backendUrl}/api/mentor/resumes/download${resumePath}`;
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

    // Construct the full URL
    const fileUrl = `${backendUrl}/api/mentor/resumes/download${resumePath}`;

    console.log("Opening resume:", fileUrl); // Debugging log

    // Open resume in new tab
    window.open(fileUrl, "_blank");
  };

  const handleDownloadCertificate = (filePath) => {
    const downloadUrl = `${backendUrl}/api/mentor/certifications/download${filePath}`;
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
    const fileUrl = `${backendUrl}/api/mentor/certifications/download${filePath}`;

    console.log("Opening file:", fileUrl); // Debugging log

    // Open file in new tab
    window.open(fileUrl, "_blank");
  };

  const handleDownloadInternship = (filePath) => {
    const downloadUrl = `${backendUrl}/api/mentor/internships/download/${filePath}`;

    // Create a hidden link element
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", filePath.split("/").pop()); // Extract filename
    document.body.appendChild(link);

    // Trigger download
    link.click();

    // Cleanup
    document.body.removeChild(link);
  };

  // 📌 Function to open internship file in a new tab
  const handleOpenInternshipFile = (filePath) => {
    if (!filePath) {
      console.error("File path is missing!");
      return;
    }

    // Remove leading slash if exists

    // Construct the full URL
    const fileUrl = `${backendUrl}/api/mentor/internships/download${filePath}`;

    console.log("Opening file:", fileUrl); // Debugging log

    // Open file in new tab
    window.open(fileUrl, "_blank");
  };


  const handleDownloadMarksheet = (filePath) => {
    if (!filePath) {
        console.error("Marksheet file path is missing!");
        return;
    }

    const downloadUrl = `${backendUrl}/api/mentor/marksheets/download${filePath}`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", filePath.split("/").pop());
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
const handleOpenMarksheetFile = (filePath) => {
  if (!filePath) {
      console.error("Marksheet file path is missing!");
      return;
  }

  const fileUrl = `${backendUrl}/api/mentor/marksheets/download${filePath}`;

  console.log("Opening marksheet file:", fileUrl); // Debugging log

  window.open(fileUrl, "_blank");
};


  const groupedBySemester = performanceData.reduce((acc, record) => {
    if (!acc[record.semester]) {
      acc[record.semester] = {
        subjects: [],
        ktSubjects: [],
        sgpa: record.sgpa,
      };
    }
    if (record.kt === 0) {
      acc[record.semester].subjects.push(record);
    } else {
      acc[record.semester].ktSubjects.push(record);
    }
    return acc;
  }, {});

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto mt-5">
        {/* Back Button */}
        <button
          onClick={handleGoBack}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors duration-200"
        >
          <FaArrowLeft className="mr-2" /> Back to Group Details
        </button>

        {/* Student Profile Header */}
        {studentProfile && (
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start">
              {studentProfile.profile_image ? (
                <img
                  src={`${backendUrl}${studentProfile.profile_image}`}
                  alt={studentProfile.student_name}
                  className="w-28 h-28 rounded-full object-cover border-4 border-blue-100 m-4"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <FaUserGraduate className="text-blue-600 text-4xl" />
                </div>
              )}
              <div className="text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-800">
                  {studentProfile.student_name}
                </h1>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    ID: {studentProfile.email_id}
                  </span>

                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    {studentProfile.academic_year}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
          <div className="flex flex-wrap border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 text-gray-600 focus:outline-none transition-all ${
                  activeTab === tab.id
                    ? "text-blue-600 font-semibold border-b-2 border-blue-600 bg-blue-50"
                    : "hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <FaSpinner className="animate-spin text-blue-600 text-3xl" />
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {activeTab === "profile" && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-blue-700 mb-6">
                Student Profile
              </h2>
              {studentProfile ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Profile Image and Basic Info */}
                  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <div className="flex flex-col items-center">
                      {studentProfile.profile_image ? (
                        <img
                          src={`${backendUrl}${studentProfile.profile_image}`}
                          alt={studentProfile.student_name}
                          className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 mb-4"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                          <FaUserGraduate className="text-blue-600 text-4xl" />
                        </div>
                      )}
                      <h3 className="text-xl font-bold text-gray-800">
                        {studentProfile.student_name}
                      </h3>
                      <p className="text-gray-500 mt-1">
                        Student ID: {studentProfile.sid}
                      </p>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {studentProfile.branch}
                        </span>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          {studentProfile.academic_year}
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                          {studentProfile.gender}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      Contact Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <span className="text-gray-500 w-24">Email:</span>
                        <span className="text-gray-800 font-medium">
                          {studentProfile.email_id}
                        </span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-gray-500 w-24">Mobile:</span>
                        <span className="text-gray-800 font-medium">
                          {studentProfile.mobile_no || "Not provided"}
                        </span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-gray-500 w-24">
                          Current Address:
                        </span>
                        <span className="text-gray-800 font-medium">
                          {studentProfile.current_address || "Not provided"}
                        </span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-gray-500 w-24">
                          Permanent Address:
                        </span>
                        <span className="text-gray-800 font-medium">
                          {studentProfile.permanent_address || "Not provided"}
                        </span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-gray-500 w-24">
                          Date of Birth:
                        </span>
                        <span className="text-gray-800 font-medium">
                          {studentProfile.date_of_birth
                            ? new Date(
                                studentProfile.date_of_birth
                              ).toLocaleDateString()
                            : "Not provided"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Family Information */}
                  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      Family Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-md font-medium text-gray-700">
                          Father's Details
                        </h4>
                        <div className="ml-4 mt-2 space-y-1">
                          <p>
                            <span className="text-gray-500">Name:</span>{" "}
                            {studentProfile.father_name || "Not provided"}
                          </p>
                          <p>
                            <span className="text-gray-500">Mobile:</span>{" "}
                            {studentProfile.father_mobile || "Not provided"}
                          </p>
                          <p>
                            <span className="text-gray-500">Email:</span>{" "}
                            {studentProfile.father_email || "Not provided"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-md font-medium text-gray-700">
                          Mother's Details
                        </h4>
                        <div className="ml-4 mt-2 space-y-1">
                          <p>
                            <span className="text-gray-500">Name:</span>{" "}
                            {studentProfile.mother_name || "Not provided"}
                          </p>
                          <p>
                            <span className="text-gray-500">Mobile:</span>{" "}
                            {studentProfile.mother_mobile || "Not provided"}
                          </p>
                          <p>
                            <span className="text-gray-500">Email:</span>{" "}
                            {studentProfile.mother_email || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                        />
                      </svg>
                      Academic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p>
                          <span className="font-medium">Branch:</span>{" "}
                          {studentProfile.branch}
                        </p>
                        <p>
                          <span className="font-medium">Academic Year:</span>{" "}
                          {studentProfile.academic_year}
                        </p>
                        <p>
                          <span className="font-medium">Faculty Mentor:</span>{" "}
                          {studentProfile.faculty_mentor || "Not assigned"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="rounded-full bg-gray-200 h-24 w-24 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2.5"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3 mb-6"></div>
                    <div className="h-2 bg-gray-200 rounded w-5/6 mb-2.5"></div>
                    <div className="h-2 bg-gray-200 rounded w-4/6 mb-2.5"></div>
                    <div className="h-2 bg-gray-200 rounded w-3/6"></div>
                  </div>
                  <p className="text-gray-500 mt-6">
                    Not uploaded
                  </p>
                </div>
              )}
            </div>
          )}
          {activeTab === "results" && !loading && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-blue-700 mb-6">
                Academic Performance
              </h2>

              {Object.keys(groupedBySemester).length > 0 ? (
                Object.entries(groupedBySemester).map(
                  ([semester, { subjects, ktSubjects, sgpa }]) => (
                    <div
                      key={semester}
                      className="mb-8 bg-gray-50 p-6 rounded-lg"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">
                          Semester {semester}
                        </h3>
                        <div className="mt-2 md:mt-0">
                          <span
                            className={`px-4 py-2 rounded-full text-sm font-bold ${
                              parseFloat(sgpa) >= 7.5
                                ? "bg-green-100 text-green-800"
                                : parseFloat(sgpa) >= 6
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            SGPA: {sgpa}
                          </span>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="font-medium text-gray-700 mb-3">
                          Regular Subjects
                        </h4>
                        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Subject
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  IA1
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  IA2
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  TW
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  ORPR
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  University Exam
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {subjects.length > 0 ? (
                                subjects.map((subject, index) => (
                                  <tr
                                    key={index}
                                    className={
                                      index % 2 === 0
                                        ? "bg-white"
                                        : "bg-gray-50"
                                    }
                                  >
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                      {subject.subject}
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm text-gray-500">
                                      {subject.IA1}
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm text-gray-500">
                                      {subject.IA2}
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm text-gray-500">
                                      {subject.TW}
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm text-gray-500">
                                      {subject.ORPR}
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm text-gray-500">
                                      {subject.university_exam}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <span
                                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                          subject.pass_fail === "Pass"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                        }`}
                                      >
                                        {subject.pass_fail}
                                      </span>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan="7"
                                    className="px-4 py-4 text-center text-gray-500"
                                  >
                                    No subjects found
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {ktSubjects.length > 0 && (
                        <div className="mt-6">
                          <h4 className="font-medium text-red-600 mb-3">
                            KT Subjects
                          </h4>
                          <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead>
                                <tr className="bg-red-50">
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Subject
                                  </th>
                                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Attempt
                                  </th>
                                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Academic Year
                                  </th>
                                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    IA1
                                  </th>
                                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    IA2
                                  </th>
                                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    TW
                                  </th>
                                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ORPR
                                  </th>
                                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    University Exam
                                  </th>
                                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {ktSubjects.map((subject, index) => (
                                  <tr
                                    key={index}
                                    className={
                                      index % 2 === 0 ? "bg-white" : "bg-red-50"
                                    }
                                  >
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                      {subject.subject}
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm text-gray-500">
                                      {subject.attempt}
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm text-gray-500">
                                      {subject.academic_year}
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm text-gray-500">
                                      {subject.IA1}
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm text-gray-500">
                                      {subject.IA2}
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm text-gray-500">
                                      {subject.TW}
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm text-gray-500">
                                      {subject.ORPR}
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm text-gray-500">
                                      {subject.university_exam}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <span
                                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                          subject.pass_fail === "Pass"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                        }`}
                                      >
                                        {subject.pass_fail}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <p className="text-xl">
                    No academic records found for this student.
                  </p>
                </div>
              )}
            </div>
          )}
          {activeTab === "internships" && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-blue-700 mb-6">
                Internship Experience
              </h2>

              {internshipData.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <p className="text-xl">
                    No internship records found for this student.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Semester
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Job Role
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Period
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Certificate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {internshipData.map((internship, index) => (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          <td className="px-4 py-3 text-sm text-gray-500">
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              Semester {internship.semester}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {internship.company_name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {internship.job_role}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {internship.description}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {internship.duration} days
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(
                              internship.from_date
                            ).toLocaleDateString()}{" "}
                            -{" "}
                            {new Date(internship.to_date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-center">
                            {internship.file_path ? (
                              <div className="flex justify-center space-x-2">
                                <button
                                  onClick={() =>
                                    handleDownloadInternship(
                                      internship.file_path
                                    )
                                  }
                                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors duration-200"
                                >
                                  <FaDownload className="inline mr-1" />{" "}
                                  Download
                                </button>
                                <button
                                  onClick={() =>
                                    handleOpenInternshipFile(
                                      internship.file_path
                                    )
                                  }
                                  className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors duration-200"
                                >
                                  <FaEye className="inline mr-1" /> View
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-400">
                                No certificate
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          {activeTab === "certifications" && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-blue-700 mb-6">
                Professional Certifications
              </h2>

              {certificationData.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <p className="text-xl">
                    No certification records found for this student.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certificationData.map((certification, index) => (
                    <div
                      key={index}
                      className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Semester {certification.semester}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(
                            certification.completion_date
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {certification.certificate_name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {certification.description}
                      </p>

                      {certification.file_path ? (
                        <div className="flex space-x-2 mt-auto">
                          <button
                            onClick={() =>
                              handleDownloadCertificate(certification.file_path)
                            }
                            className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors duration-200 flex items-center justify-center"
                          >
                            <FaDownload className="mr-2" /> Download
                          </button>
                          <button
                            onClick={() =>
                              handleOpenCertificationFile(
                                certification.file_path
                              )
                            }
                            className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors duration-200 flex items-center justify-center"
                          >
                            <FaEye className="mr-2" /> View
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-gray-400 mt-4">
                          No certificate file available
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === "marksheets" && (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-blue-700 mb-6">
      Student Marksheet Records
    </h2>

    {marksheetData.length === 0 ? (
      <div className="text-center py-10 text-gray-500">
        <p className="text-xl">
          No marksheet records found for this student.
        </p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {marksheetData.map((marksheet, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                Semester {marksheet.semester}
              </span>
              <span className="text-sm text-gray-500">
                {new Date(marksheet.issue_date).toLocaleDateString()}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {marksheet.marksheet_name}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {marksheet.description}
            </p>

            {marksheet.file_path ? (
              <div className="flex space-x-2 mt-auto">
                <button
                  onClick={() => handleDownloadMarksheet(marksheet.file_path)}
                  className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors duration-200 flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
                <button
                  onClick={() => handleOpenMarksheetFile(marksheet.file_path)}
                  className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors duration-200 flex items-center justify-center"
                >
                  <FaEye className="mr-2" /> View
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-400 mt-4">
                No marksheet file available
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
)}

          {activeTab === "resume" && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-blue-700 mb-6">
                Resume Collection
              </h2>

              {resumeData.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <p className="text-xl">
                    No resume records found for this student.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {resumeData.map((resume, index) => (
                    <div
                      key={index}
                      className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {resume.job_role}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {new Date(resume.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        {resume.description}
                      </p>

                      {resume.resume_path ? (
                        <div className="flex space-x-2 mt-auto">
                          <button
                            onClick={() =>
                              handleDownloadResume(resume.resume_path)
                            }
                            className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors duration-200 flex items-center justify-center"
                          >
                            <FaDownload className="mr-2" /> Download
                          </button>
                          <button
                            onClick={() =>
                              handleOpenResumeFile(resume.resume_path)
                            }
                            className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors duration-200 flex items-center justify-center"
                          >
                            <FaEye className="mr-2" /> View
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-gray-400 mt-4">
                          No resume file available
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenteeAllDetails;
