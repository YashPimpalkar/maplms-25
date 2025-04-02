import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { backend_url } from '../../../../api';
import { toast } from 'react-toastify';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { MdMenu } from 'react-icons/md';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { AiOutlineUser } from 'react-icons/ai';

const ClassroomActivities = ({ uid }) => {
  const { classroomId } = useParams();
  const navigate = useNavigate();

  const [attendanceData, setAttendanceData] = useState(null);
  const [classroomDetails, setClassroomDetails] = useState(null);
  const [showAttendance, setShowAttendance] = useState(false);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    file_type_allowed: ['pdf'],
    max_file_size: '1024',
    deadline: '',
    files: [],
  });
  const [selectAll, setSelectAll] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Predefined file types
  const fileTypes = ['None', 'pdf', 'docx', 'zip', 'png', 'jpg', 'pptx', 'txt'];

  // Fetch classroom details
  useEffect(() => {
    const fetchClassroomDetails = async () => {
      if (!classroomId) {
        toast.error('Classroom ID is required');
        return;
      }
      setLoading(true);
      try {
        const response = await api.get(`/api/lmsclassroom/classroom/${classroomId}`);
        setClassroomDetails(response.data);
        toast.success('Classroom details fetched successfully');
      } catch (error) {
        if (error.response && error.response.status === 404) {
          toast.error('Classroom not found');
        } else {
          toast.error('Failed to fetch classroom details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchClassroomDetails();
  }, [classroomId]);

  // Fetch attendance data (using teacher and classroom IDs)
  useEffect(() => {
    const fetchAttendancePercentage = async () => {
      if (!uid || !classroomId) {
        alert('Please enter both Student ID and Classroom ID');
        return;
      }
      setLoading(true);
      try {
        const response = await api.get(`/api/lmsclassroom/attendance/percentage/${uid}/${classroomId}`);
        setAttendanceData(response.data);
      } catch (error) {
        if (!(error.response && error.response.status === 404)) {
          alert('Failed to fetch attendance percentage');
        }
      } finally {
        setLoading(false);
      }
    };

    if (uid && classroomId) {
      fetchAttendancePercentage();
    }
  }, [uid, classroomId]);

  const fetchAttendanceData = async () => {
    try {
      const response = await api.get(`/api/lmsclassroom/attendance/percentage/${classroomId}`);
      setAttendanceData(response.data);
    } catch (error) {
      toast.error('Failed to fetch attendance data');
    }
  };

  const handleUserIconClick = () => {
    setShowAttendance(!showAttendance);
    if (!attendanceData) {
      fetchAttendanceData();
    }
  };

  // Fetch activities
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await api.get(`/api/lmsclassroom/activities/show/${classroomId}`);
        setActivities(response.data);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError('Failed to load activities.');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [classroomId]);

  if (loading) return <p className="text-center mt-6 text-gray-600">Loading activities...</p>;
  if (error) return <p className="text-center mt-6 text-red-500">{error}</p>;

  // Form field change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewActivity({ ...newActivity, [name]: value });
  };

  // Handle file upload (multiple files)
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewActivity({ ...newActivity, files });
  };

  // File type selection
  const handleFileTypeChange = (type) => {
    const updatedFileTypes = newActivity.file_type_allowed.includes(type)
      ? newActivity.file_type_allowed.filter((fileType) => fileType !== type)
      : [...newActivity.file_type_allowed, type];

    if (type === 'None') {
      setNewActivity({ 
        ...newActivity, 
        file_type_allowed: ['None'],
        deadline: '',
        max_file_size: '1024'
      });
    } else {
      setNewActivity({ 
        ...newActivity, 
        file_type_allowed: updatedFileTypes.filter((fileType) => fileType !== 'None')
      });
    }
  };

  // "Select All" checkbox logic
  const handleSelectAllChange = () => {
    if (selectAll) {
      setNewActivity({ ...newActivity, file_type_allowed: [] });
    } else {
      setNewActivity({ ...newActivity, file_type_allowed: fileTypes.filter((type) => type !== 'None') });
    }
    setSelectAll(!selectAll);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', newActivity.title);
    formData.append('description', newActivity.description);
    formData.append('max_file_size', newActivity.max_file_size);
    // Only append deadline if file type is not 'None'
    if (!newActivity.file_type_allowed.includes('None')) {
      formData.append('deadline', newActivity.deadline);
    }
    // Don't append deadline at all if 'None' is selected
    formData.append('file_type_allowed', JSON.stringify(newActivity.file_type_allowed));
    formData.append('teacher_id', uid);


    try {
      const response = await api.post(`/api/lmsclassroom/activities/create/${classroomId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const newCreatedActivity = response.data;
      setActivities([newCreatedActivity, ...activities]);
      setNewActivity({
        title: '',
        description: '',
        file_type_allowed: ['pdf'],
        max_file_size: '1024',
        deadline: '',
        files: [],
      });
      setSelectAll(false);
      setShowForm(false);
      toast.success('Activity created successfully!');
    } catch (error) {
      console.error("Error creating activity:", error);
      toast.error('Failed to create activity.');
    }
  };

  // File download & open handlers
  const handleDownload = (fileId, fileName) => {
    const downloadUrl = `${backend_url}/api/lmsclassroom/activities/download/${fileId}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenFile = (fileId) => {
    const fileUrl = `${backend_url}/api/lmsclassroom/activities/download/${fileId}`;
    window.open(fileUrl, '_blank');
  };

  const handleViewSubmissions = (assignmentId) => {
    navigate(`/lms/viewclassroom/${classroomId}/submissions/${assignmentId}`);
  };


  const goToQuiz = () => {
    navigate(`/lms/viewclassroom/${classroomId}/quiz`); // Change this to your quiz page route
  };

  return (
    <div className="min-h-screen bg-gray-100 mt-5">
      <div className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <button
          className="text-blue-500 mb-4 hover:underline"
          onClick={() => navigate(-1)}
        >
          &larr; Back to All Classrooms
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-lg p-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <FaChalkboardTeacher className="text-4xl" />
            <div>
              <h2 className="text-2xl font-bold">{classroomDetails?.room_name || 'N/A'}</h2>
              <p className="text-sm font-medium">{classroomDetails?.teacher_names || 'N/A'}</p>
            </div>
          </div>
          <div>
            <AiOutlineUser
              onClick={handleUserIconClick}
              className="text-4xl cursor-pointer hover:text-gray-200 transition-colors duration-300"
            />
          </div>
        </div>

        {/* Attendance Details */}
        {showAttendance && (
          <div className="mt-6">
            {attendanceData ? (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <h3 className="text-xl font-bold text-blue-800 mb-2 md:mb-0">
                    Attendance Details
                  </h3>
                  <div className="flex items-center">
                    <span className="text-lg font-semibold text-gray-700 mr-2">
                      Attendance Percentage:
                    </span>
                    <span className="text-2xl font-bold text-blue-700">
                      {parseFloat(attendanceData.attendance_percentage).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 text-center text-gray-500">
                <p>No attendance data available for this classroom.</p>
              </div>
            )}
          </div>
        )}

        {/* New Activity Form Toggle */}
        <div className="mt-6">
          {!showForm ? (
          <div className="flex space-x-4">
          <button 
            onClick={() => setShowForm(true)} 
            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition-colors duration-300"
          >
            Create New Activity
          </button>
          <button 
            onClick={goToQuiz} 
            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition-colors duration-300"
          >
            Quizzes
          </button>
        </div>
        
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Create New Activity</h3>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="title">
                  Activity Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newActivity.title}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={newActivity.description}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="file">
                  Upload Files
                </label>
                <input
                  type="file"
                  id="file"
                  name="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full border border-gray-300 p-2 rounded-lg"
                  accept={newActivity.file_type_allowed.join(',')}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Allowed File Types</label>
                <div className="mb-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAllChange}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                    <span className="ml-2">Select All</span>
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {fileTypes.map((type) => (
                    <div key={type}>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={newActivity.file_type_allowed.includes(type)}
                          onChange={() => handleFileTypeChange(type)}
                          className="form-checkbox h-5 w-5 text-blue-600"
                        />
                        <span className="ml-2">{type}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {!newActivity.file_type_allowed.includes('None') && (
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Max File Size</label>
                  <select
                    id="max_file_size"
                    name="max_file_size"
                    value={newActivity.max_file_size}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  >
                    <option value="256">256 KB</option>
                    <option value="1024">1 MB</option>
                    <option value="10240">10 MB</option>
                    <option value="102400">100 MB</option>
                    <option value="1048576">1 GB</option>
                    <option value="10485760">10 GB</option>
                  </select>
                </div>
              )}

              {!newActivity.file_type_allowed.includes('None') && (
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2" htmlFor="deadline">
                    Deadline
                  </label>
                  <input
                    type="datetime-local"
                    id="deadline"
                    name="deadline"
                    value={newActivity.deadline}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
              )}
              <div className="flex space-x-4">
                <button 
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition-colors duration-300"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition-colors duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Activities List */}
        <div className="mt-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Existing Activities</h3>
          {activities.length === 0 ? (
            <p className="text-gray-500">No activities found.</p>
          ) : (
            <ul className="space-y-4">
              {activities
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .map((activity) => (
                  <li
                    key={activity.assignment_id}
                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col md:flex-row justify-between"
                    onClick={() => handleViewSubmissions(activity.assignment_id)}
                  >
                    <div className="md:w-3/4">
                      <h4 className="text-xl font-semibold text-blue-700 mb-2">
                        {activity.title}
                      </h4>
                      <p className="text-xs text-gray-500 mb-2">
                        Created: {new Date(activity.created_at).toLocaleDateString('en-US', {
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-700 mb-2">
                        {activity.description}
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        {Array.isArray(activity.files) && activity.files.length > 0 ? (
                          activity.files.map((file, index) => {
                            const fileExtension = file.file_name.split('.').pop();
                            return (
                              <div
                                key={index}
                                className="border p-2 rounded-md flex flex-col items-center hover:bg-gray-50 transition-colors duration-300"
                                onClick={() => handleDownload(file.file_id, file.file_name)}
                              >
                                <span className="text-xs text-blue-500 truncate w-full text-center" style={{ maxWidth: '150px' }}>
                                  {file.file_name}
                                </span>
                                <p className="text-xs text-gray-500">
                                  Extension: {fileExtension}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(file.file_size / 1024).toFixed(2)} KB
                                </p>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-gray-500">No files uploaded</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:w-1/4 text-right">
                      {activity.file_type_allowed && 
                       !activity.file_type_allowed.includes("None") &&
                       activity.deadline && (
                          <p className="text-sm text-red-500">
                            Deadline:{" "}
                            {new Date(activity.deadline).toLocaleString(
                              "en-US",
                              {
                                day: "numeric",
                                month: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                              }
                            )}
                          </p>
                        )}
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassroomActivities;
