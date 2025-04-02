import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { backend_url } from "../../api";
import { toast } from "react-toastify";
import {
  FaChalkboardTeacher,
  FaCalendarAlt,
  FaFileDownload,
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaUserGraduate,
} from "react-icons/fa";
import { BsFileEarmarkText, BsClockHistory } from "react-icons/bs";

const StudentClassRoomActivities = ({ uid }) => {
  const { classroomId } = useParams();
   const [quizzes, setQuizzes] = useState([]);
  const [activities, setActivities] = useState([]);
  const [fileUpload, setFileUpload] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [attendanceDates, setAttendanceDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [classroomDetails, setClassroomDetails] = useState(null);
  const [showAttendance, setShowAttendance] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
      fetchQuizzes();
    }, []);
  
    const fetchQuizzes = async () => {
      try {
        const response = await api.get(`/api/lmsclassroom/activities/quizzes/${classroomId}/${uid}`);
        setQuizzes(response.data);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      } finally {
        setLoading(false);
      }
    };

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
        toast.success("Classroom details fetched successfully");
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

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await api.post(
          `/api/studentlms/classroom/getactivities/${classroomId}`,
          { student_id: uid }
        );
        const data = response.data;

        const sortedActivities = data.activities.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setActivities(sortedActivities);
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    };

    fetchActivities();
  }, [classroomId, uid]);

  const handleDownload = (e, fileId, fileName) => {
    e.stopPropagation();
    const downloadUrl = `${backend_url}/api/lmsclassroom/activities/download/${fileId}`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (event) => {
    setFileUpload(event.target.files[0]);
  };

  const handleFileUpload = async (assignmentId) => {
    if (!fileUpload) return;

    const formData = new FormData();
    formData.append("file", fileUpload);
    formData.append("assignment_id", assignmentId);
    formData.append("student_id", uid);

    try {
      await api.post(
        `${backend_url}/api/lmsclassroom/activities/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("File uploaded successfully!");
      setFileUpload(null);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("File upload failed!");
    }
  };

  useEffect(() => {
    const fetchAttendancePercentage = async () => {
      if (!uid || !classroomId) {
        return;
      }

      setLoading(true);
      try {
        const response = await api.get(
          `/api/lmsclassroom/attendance/percentage/${uid}/${classroomId}`
        );
        setAttendanceData(response.data);

        const response2 = await api.get(
          `/api/lmsclassroom/attendance/attandance/${uid}/${classroomId}`
        );
        setAttendanceDates(response2.data);
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
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isDeadlinePassed = (deadline) => {
    return new Date(deadline) < new Date();
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
                <FaUserGraduate className="mr-2" />
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
              <FaArrowLeft className="mr-2" /> Back to All Classrooms
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
                <FaCalendarAlt className="mr-2" /> Attendance Records
              </h2>
            </div>

            <div className="p-6">
              {attendanceData ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
                    <div className="mb-4 sm:mb-0">
                      <span className="text-sm font-medium text-gray-500">
                        Overall Attendance
                      </span>
                      <div className="flex items-center mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-xs">
                          <div
                            className={`h-2.5 rounded-full ${
                              parseFloat(
                                attendanceData.attendance_percentage
                              ) >= 75
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

                    <div className="flex space-x-4">
                      <div className="text-center px-4 py-2 bg-green-50 rounded-lg">
                        <span className="text-sm text-gray-500">Present</span>
                        <p className="text-lg font-bold text-green-600">
                          {attendanceData.present_count || 0}
                        </p>
                      </div>
                      <div className="text-center px-4 py-2 bg-red-50 rounded-lg">
                        <span className="text-sm text-gray-500">Absent</span>
                        <p className="text-lg font-bold text-red-600">
                          {attendanceData.absent_count || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {attendanceDates.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Date
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Time Slot
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {attendanceDates.map((record, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {record.attendance_date}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {record.time_slot}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {record.attandance === "Present" ? (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    Present
                                  </span>
                                ) : (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                    Absent
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      No attendance records available.
                    </p>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading attendance data...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}



      
      <div>
            <h2 className="text-xl font-bold mb-4">Available Quizzes</h2>
            {loading ? (
              <p>Loading quizzes...</p>
            ) : quizzes.length === 0 ? (
              <p>No quizzes available!</p>
            ) : (
              quizzes.map((quiz) => (
                <button
                  key={quiz.formId}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg m-2 hover:bg-blue-700 transition"
                  onClick={() => navigate(`/viewclassroom/${classroomId}/quiz/${quiz.formId}`)}
                >
                  Attempt {quiz.title}
                </button>
              ))
            )}
          </div>

      {/* Activities Section */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-100">
            <h2 className="text-lg font-semibold text-indigo-800 flex items-center">
              <BsFileEarmarkText className="mr-2" /> Course Activities
            </h2>
          </div>

          <div className="p-6">
            {activities.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No activities
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  No activities have been assigned for this classroom yet.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {activities.map((activity) => (
                  <div
                    key={activity.assignment_id}
                    className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer"
                    onClick={() =>
                      navigate(
                        `/lms/activity-detail/${activity.assignment_id}`,
                        { state: { activity, uid, classroomId } }
                      )
                    }
                  >
                    <div className="flex flex-col w-full">
                      {/* Activity Header */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start p-4 border-b">
                        <div>
                          <h4 className="text-lg font-semibold text-blue-700">
                            {activity.title}
                          </h4>
                          <p className="text-gray-500 text-xs mt-1">
                            Created:{" "}
                            {new Date(activity.created_at).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>

                        {/* Conditionally Show Deadline & Status */}
                        {activity.file_type?.toLowerCase() !== "none" &&
                          activity.deadline && (
                            <div className="mt-2 sm:mt-0 flex items-center">
                              <div
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  activity.isSubmitted
                                    ? "bg-green-100 text-green-800"
                                    : isDeadlinePassed(activity.deadline)
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {activity.isSubmitted
                                  ? "Submitted"
                                  : isDeadlinePassed(activity.deadline)
                                  ? "Overdue"
                                  : "Pending"}
                              </div>
                              <div className="ml-3 flex items-center text-xs text-red-500">
                                <BsClockHistory className="mr-1" />
                                Due:{" "}
                                {new Date(activity.deadline).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}{" "}
                                at {formatTime(activity.deadline)}
                              </div>
                            </div>
                          )}
                      </div>

                      {/* Activity Content */}
                      <div className="p-4">
                        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                          {activity.description}
                        </p>

                        {/* Files Section */}
                        {Array.isArray(activity.files) &&
                          activity.files.length > 0 && (
                            <div className="mt-4">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">
                                Attached Files:
                              </h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {activity.files.map((file, index) => {
                                  const fileExtension = file.file_name
                                    .split(".")
                                    .pop();

                                  return (
                                    <div
                                      key={index}
                                      className="flex items-center p-2 border border-gray-200 rounded hover:bg-gray-50 transition"
                                      onClick={(e) =>
                                        handleDownload(
                                          e,
                                          file.file_id,
                                          file.file_name
                                        )
                                      }
                                    >
                                      <div className="bg-blue-100 p-2 rounded mr-3">
                                        <FaFileDownload className="text-blue-600" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                          {file.file_name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {fileExtension.toUpperCase()} •{" "}
                                          {(file.file_size / 1024).toFixed(2)}{" "}
                                          KB
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                      </div>

                      {/* Activity Footer */}
                      <div className="bg-gray-50 px-4 py-3 flex justify-end">
                        <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

export default StudentClassRoomActivities;