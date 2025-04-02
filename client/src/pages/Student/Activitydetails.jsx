import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api, { backend_url } from "../../api";
import { toast } from "react-toastify";
import {
  FaChalkboardTeacher,
  FaCalendarAlt,
  FaFileDownload,
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaFileUpload,
  FaTrashAlt,
  FaCommentDots,
} from "react-icons/fa";
import { BsFileEarmarkText, BsClockHistory, BsPaperclip } from "react-icons/bs";
import { AiOutlineUser } from "react-icons/ai";

const ActivityDetail = ({sid}) => {
  const location = useLocation();
  const [quizzes, setQuizzes] = useState([]);
  const { activity, uid } = location.state;
  const [fileUpload, setFileUpload] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [classroomId, setClassroomId] = useState(activity.classroom_id);
  const [submissions, setSubmissions] = useState([]);
  const [attendanceData, setAttendanceData] = useState(null);
  const [classroomDetails, setClassroomDetails] = useState(null);
  const [showAttendance, setShowAttendance] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [error, setError] = useState(null);

  // Format date for better display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format time for better display
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Check if deadline has passed
  const isDeadlinePassed = (deadline) => {
    return new Date(deadline) < new Date();
  };

  const fetchAttendanceData = async () => {
    try {
      const response = await api.get(
        `/api/lmsclassroom/attendance/percentage/${classroomId}`
      );
      setAttendanceData(response.data);
    } catch (error) {
      toast.error("Failed to fetch attendance data");
    }
  };

  useEffect(() => {
    const fetchAttendancePercentage = async () => {
      if (!uid || !classroomId) {
        toast.error("Student ID and Classroom ID are required");
        return;
      }

      setLoading(true);
      try {
        const response = await api.get(
          `/api/lmsclassroom/attendance/percentage/${uid}/${classroomId}`
        );
        setAttendanceData(response.data);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // Handle 404
        } else {
          toast.error("Failed to fetch attendance percentage");
        }
      } finally {
        setLoading(false);
      }
    };

    if (uid && classroomId) {
      fetchAttendancePercentage();
    }
  }, [uid, classroomId]);

  const handleUserIconClick = () => {
    setShowAttendance(!showAttendance);
    if (!attendanceData) {
      fetchAttendanceData();
    }
  };

  const handleDownload = (fileId, fileName) => {
    const downloadUrl = `${backend_url}/api/lmsclassroom/activities/download/${fileId}`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(
          `/api/studentlms/submissions/${activity.assignment_id}`
        );
        setSubmission(response.data);
        setLoading(false);
      } catch (error) {
        setError("Error fetching submission details");
        setLoading(false);
      }
    };

    if (activity.assignment_id) {
      fetchSubmissionDetails();
    }
  }, [activity.assignment_id]);



  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const formData = new FormData();
        formData.append("assignment_id", activity.assignment_id);
        formData.append("student_id", uid);

        const response = await api.post(
          "/api/studentlms/getsubmissions",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setSubmissions(response.data.submissions);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [activity.assignment_id, uid]);

  useEffect(() => {
    const fetchClassroomDetails = async () => {
      if (!classroomId) {
        toast.error("Classroom ID is required");
        return;
      }

      setLoading(true);
      try {
        const response = await api.get(
          `/api/lmsclassroom/classroom/${classroomId}`
        );
        setClassroomDetails(response.data);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          toast.error("Classroom not found");
        } else {
          toast.error("Failed to fetch classroom details");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchClassroomDetails();
  }, [classroomId]);

  const fetchSubmissions = async () => {
    try {
      const formData = new FormData();
      formData.append("assignment_id", activity.assignment_id);
      formData.append("student_id", uid);

      const response = await api.post(
        "/api/studentlms/getsubmissions",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSubmissions(response.data.submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    const maxFileSize = activity.max_file_size * 1024;
    const allowedTypes = activity.file_type_allowed
      .split(",")
      .map((type) => type.trim().toLowerCase().replace(".", ""));

    const validFiles = [];

    // Validate each file
    for (let file of files) {
      const fileType = file.name.split(".").pop().toLowerCase();
      if (!allowedTypes.includes(fileType)) {
        setFileError(
          `File type "${fileType}" not allowed. Allowed types: ${activity.file_type_allowed}`
        );
        setFileUpload(null);
        return;
      } else if (file.size > maxFileSize) {
        setFileError(
          `File size of "${file.name}" should not exceed ${activity.max_file_size} KB`
        );
        setFileUpload(null);
        return;
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) return;

    setFileError(null);
    setFileUpload(validFiles);
    const formData = new FormData();

    validFiles.forEach((file) => formData.append("files", file));
    formData.append("student_id", uid);
    formData.append("classroom_id", activity.classroom_id);
    formData.append("assignment_id", activity.assignment_id);

    setUploading(true);

    try {
      await api.post(
        `/api/studentlms/submission/${activity.assignment_id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Files uploaded successfully!");
      setFileUpload(null);
      fetchSubmissions();
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("File upload failed!");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = () => {
    // Implement delete functionality
  };

  const handleSubmission = async () => {
    setUploading(true);
    try {
      const response = await api.post(
        `/api/studentlms/markasdone/${submission.submission_id}`
      );

      if (response.status === 200) {
        toast.success("Submission marked successfully!");
      } else {
        console.error("Error updating submission:", response.data.error);
        toast.error("Failed to mark submission.");
      }
    } catch (error) {
      console.error("Error updating submission:", error);
      toast.error("Failed to mark submission due to a network error.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-6 px-4 sm:px-6">
      {/* Header with classroom info */}
      <div className="max-w-6xl mx-auto mb-6 mt-10">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FaChalkboardTeacher className="text-white text-2xl" />
                <div>
                  <h1 className="text-xl font-bold text-white">
                    {loading
                      ? "Loading..."
                      : classroomDetails?.room_name || "Classroom"}
                  </h1>
                  <p className="text-blue-100 text-sm">
                    {loading
                      ? ""
                      : classroomDetails?.teacher_names || "Teacher"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleUserIconClick}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg px-4 py-2 flex items-center transition duration-200"
              >
                <AiOutlineUser className="mr-2" />
                {showAttendance ? "Hide Attendance" : "View Attendance"}
              </button>
            </div>
          </div>

          {/* Navigation bar */}
          <div className="px-6 py-3 bg-gray-50 border-b flex justify-between items-center">
            <button
              onClick={() => navigate(-1)}
              className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium transition duration-200"
            >
              <FaArrowLeft className="mr-2" /> Back to Activities
            </button>

            {attendanceData && (
              <div className="flex items-center">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  Attendance:{" "}
                  {parseFloat(attendanceData.attendance_percentage).toFixed(2)}%
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Attendance Details Panel */}
      {showAttendance && (
        <div className="max-w-6xl mx-auto mb-6 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-100">
              <h2 className="text-lg font-semibold text-indigo-800 flex items-center">
                <FaCalendarAlt className="mr-2" /> Attendance Details
              </h2>
            </div>

            <div className="p-6">
              {attendanceData ? (
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div className="mb-4 sm:mb-0">
                    <span className="text-sm font-medium text-gray-500">
                      Overall Attendance
                    </span>
                    <div className="flex items-center mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-xs">
                        <div
                          className={`h-2.5 rounded-full ${
                            parseFloat(attendanceData.attendance_percentage) >=
                            75
                              ? "bg-green-600"
                              : parseFloat(
                                  attendanceData.attendance_percentage
                                ) >= 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${attendanceData.attendance_percentage}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-lg font-bold text-gray-700">
                        {parseFloat(
                          attendanceData.attendance_percentage
                        ).toFixed(2)}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">
                    No attendance data available for this classroom.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Assignment Details */}
          <div className="lg:w-2/3 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-100">
              <h2 className="text-lg font-semibold text-indigo-800 flex items-center">
                <BsFileEarmarkText className="mr-2" /> Assignment Details
              </h2>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {activity.title}
                </h1>

                <div className="flex flex-wrap items-center text-sm text-gray-500 mb-4">
                  <span className="flex items-center mr-4 mb-2">
                    <FaChalkboardTeacher className="mr-1 text-blue-500" />
                    {activity.teacher_names || "Teacher"}
                  </span>

                  <span className="flex items-center mr-4 mb-2">
                    <BsClockHistory className="mr-1 text-blue-500" />
                    Posted: {formatDate(activity.created_at)}
                  </span>

                  {activity.file_type_allowed?.toLowerCase() !== "none" &&
                    activity.deadline && (
                      <span
                        className={`flex items-center mb-2 ${
                          isDeadlinePassed(activity.deadline)
                            ? "text-red-500"
                            : "text-orange-500"
                        }`}
                      >
                        <FaCalendarAlt className="mr-1" />
                        Due: {formatDate(activity.deadline)} at{" "}
                        {formatTime(activity.deadline)}
                      </span>
                    )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <p className="text-gray-700 whitespace-pre-line">
                    {activity.description}
                  </p>
                </div>

                {/* Assignment Files */}
                {Array.isArray(activity.files) && activity.files.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                      <BsPaperclip className="mr-2 text-blue-500" />
                      Attached Materials
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activity.files.map((file, index) => {
                        const fileExtension = file.file_name.split(".").pop();

                        return (
                          <div
                            key={index}
                            onClick={() =>
                              handleDownload(file.file_id, file.file_name)
                            }
                            className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            <div className="bg-blue-100 p-2 rounded-md mr-3">
                              <FaFileDownload className="text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {file.file_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {fileExtension.toUpperCase()} •{" "}
                                {(file.file_size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Assignment Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-700 mb-1">
                      Points
                    </h4>
                    <p className="text-lg font-bold text-gray-800">
                      {submission?.marks || "N/A"}
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-700 mb-1">
                      Status
                    </h4>
                    <p
                      className={`text-lg font-bold ${
                        activity.isSubmitted ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {activity.isSubmitted ? "Submitted" : "Missing"}
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-700 mb-1">
                      Allowed File Types
                    </h4>
                    <p className="text-sm font-medium text-gray-800">
                      {activity.file_type_allowed || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Submission */}
          <div className="lg:w-1/3 space-y-6">
            {/* Your Submission */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-100">
                <h2 className="text-lg font-semibold text-indigo-800 flex items-center">
                  <FaFileUpload className="mr-2" /> Your Submission
                </h2>
              </div>

              <div className="p-6">
                {submissions.length > 0 ? (
                  <div className="space-y-3 mb-6">
                    {submissions.map((file) => {
                      const fileExtension = file.file_name
                        .split(".")
                        .pop()
                        .toUpperCase();
                      return (
                        <div
                          key={file.file_id}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center overflow-hidden">
                            <div className="bg-indigo-100 p-2 rounded-md mr-3">
                              <BsFileEarmarkText className="text-indigo-600" />
                            </div>
                            <div className="min-w-0">
                              <p
                                className="text-sm font-medium text-gray-900 truncate"
                                title={file.file_name}
                              >
                                {file.file_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {fileExtension} •{" "}
                                {new Date(file.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDelete(file.file_id)}
                            className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <BsFileEarmarkText className="text-gray-400 text-xl" />
                    </div>
                    <p className="text-gray-500 mb-2">No files submitted yet</p>
                    <p className="text-xs text-gray-400">
                      Upload your work to complete this assignment
                    </p>
                  </div>
                )}

                {/* File Upload Section */}
                {activity.file_type_allowed &&
                  activity.file_type_allowed.toLowerCase() !== "none" && (
                    <div>
                      <label className="flex items-center justify-center cursor-pointer border border-dashed border-gray-300 rounded-lg p-4 mb-4 text-blue-600 hover:bg-blue-50 transition">
                        <input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                          accept={activity.file_type_allowed}
                        />
                        <div className="text-center">
                          <BsFileEarmarkText className="mx-auto text-xl mb-2" />
                          <span className="text-sm font-medium">
                            Click to upload files
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            Max size: {activity.max_file_size} KB •{" "}
                            {activity.file_type_allowed}
                          </p>
                        </div>
                      </label>

                      {/* Error Message */}
                      {fileError && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4">
                          {fileError}
                        </div>
                      )}

                      {/* Submit Button */}
                      <button
                        onClick={handleSubmission}
                        disabled={uploading}
                        className={`w-full py-2 px-4 rounded-lg font-medium text-white ${
                          uploading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                        } transition-colors flex items-center justify-center`}
                      >
                        {uploading ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Processing...
                          </>
                        ) : activity.isSubmitted ? (
                          "Update Submission"
                        ) : (
                          "Mark as Done"
                        )}
                      </button>
                    </div>
                  )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-100">
                <h2 className="text-lg font-semibold text-indigo-800 flex items-center">
                  <FaCommentDots className="mr-2" /> Private Comments
                </h2>
              </div>

              <div className="p-6">
                <div className="border border-gray-200 rounded-lg p-3 focus-within:border-blue-400 transition-colors">
                  <textarea
                    className="w-full border-none resize-none focus:outline-none text-sm text-gray-700 min-h-[80px]"
                    placeholder={`Add a private comment to ${
                      activity.teacher_names || "teacher"
                    }...`}
                  ></textarea>
                  <div className="flex justify-end mt-2">
                    <button className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                      Send
                    </button>
                  </div>
                </div>

                <div className="mt-4 text-center text-sm text-gray-500">
                  <p>No comments yet</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ActivityDetail;
