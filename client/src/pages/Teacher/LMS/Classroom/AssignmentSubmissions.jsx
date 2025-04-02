import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { backend_url } from '../../../../api';
import { toast } from 'react-toastify';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { MdMenu } from 'react-icons/md';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { AiOutlineUser } from 'react-icons/ai';


const AssignmentSubmissions = ({ uid }) => {
  const { classroomId, assignmentId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activities, setActivities] = useState([]);
  const [attendanceData, setAttendanceData] = useState(null);
  const [classroomDetails, setClassroomDetails] = useState(null);
  const [showAttendance, setShowAttendance] = useState(false);


  const navigate = useNavigate();
  

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

  const fetchAttendanceData = async () => {
    try {
      const response = await api.get(`/api/lmsclassroom/attendance/percentage/${classroomId}`);
      setAttendanceData(response.data);
    } catch (error) {
      toast.error('Failed to fetch attendance data');
    }
  };

  useEffect(() => {
    const fetchAttendancePercentage = async () => {
      if (!uid || !classroomId) {
        alert('Please enter both Student ID and Classroom ID');
        return;
      }
  
      setLoading(true);
      try {
        const response = await api.get(`/api/lmsclassroom/attendance/percentage/${uid}/${classroomId}`);
        // console.log(response.data)
        setAttendanceData(response.data);
        
      } catch (error) {
        if (error.response && error.response.status === 404) {
          
        } else {
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
  
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await api.get(`/api/lmsclassroom/activities/submissions/${assignmentId}`);
        setSubmissions(response.data);
        setFilteredSubmissions(response.data);
      } catch (err) {
        console.error('Error fetching submissions:', err);
        setError('Failed to load submissions.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [assignmentId]);

  useEffect(() => {
    const fetchActivityDetails = async () => {
      try {
        setLoading(true);
        // Fetch data from the API endpoint
        const response = await api.get(`/api/lmsclassroom/activities/activities/${assignmentId}`);
        setActivities(response.data[0]); // Assuming the data is in `data.data`
        setLoading(false);
      } catch (error) {
        setError('Error fetching activity details');
        setLoading(false);
      }
    };

    if (assignmentId) {
      fetchActivityDetails();
    }
  }, [assignmentId]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    const searchTermLower = e.target.value.toLowerCase();
    const filtered = submissions.filter((submission) =>
      submission.student_name.toLowerCase().includes(searchTermLower) ||
      submission.stud_clg_id.toLowerCase().includes(searchTermLower)
    );
    setFilteredSubmissions(filtered);
  };

  const handleDownload = (fileId, fileName) => {
    const downloadUrl = `${backend_url}/api/studentlms/submissions/download/${fileId}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenFile = (fileId) => {
    const fileUrl = `${backend_url}/api/studentlms/submissions/download/${fileId}`;
    window.open(fileUrl, '_blank');
  };

  

  const handleMarksChange = (submissionId, marksText) => {
    // Convert the text input to an integer, or set to null if invalid
    const marks = parseInt(marksText, 10);
    setFilteredSubmissions((prevSubmissions) =>
      prevSubmissions.map((submission) =>
        submission.submission_id === submissionId ? { ...submission, marks: isNaN(marks) ? null : marks } : submission
      )
    );
  };

  const saveMarks = async (submissionId, marks) => {
    if (isNaN(marks)) {
      alert('Please enter a valid integer for marks');
      return;
    }

    try {
      await api.post(`/api/studentlms/submissions/marks/${submissionId}`, { marks });
      alert('Marks updated successfully');
    } catch (err) {
      console.error('Error updating marks:', err);
      alert('Failed to update marks');
    }
  };

  if (loading) return <p>Loading submissions...</p>;
  if (error) return <p>{error}</p>;
  console.log(activities)


console.log(classroomDetails)


  const handleUserIconClick = () => {
    setShowAttendance(!showAttendance);
    if (!attendanceData) {
      fetchAttendanceData();
    }
  };




  return (
    <div className="p-6 left-0 z-45 w-full mt-8 ">
     
    <button
      className="text-blue-500 mb-1 mt-1"
      onClick={() => navigate(-1)}
    >
      &larr; Back to All Activities
    </button>
       <div className="flex items-center justify-between w-full bg-white shadow-lg p-4 mb-3 rounded-lg">
        {/* Left section with menu icon and classroom title */}
        <div className="flex items-center space-x-4">
          
          <div className="flex items-center space-x-2">
            <FaChalkboardTeacher className="text-3xl text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-800">Classroom</h2>
            <span className="text-gray-500">{'>'}</span>
            {loading ? (
              <span className="text-gray-500">Loading...</span>
            ) : (
              <div className="flex flex-col ">
              <h2 className="text-base font-semibold text-blue-700">
                {classroomDetails?.room_name || 'N/A'}
              </h2>
              <h2 className="text-sm font-semibold text-blue-700">
                {activities?.title || 'N/A'}
              </h2>
              <p className="text-xs font-medium text-gray-600 ">
                {classroomDetails?.teacher_names || 'N/A'}
              </p>
            </div>
            )}
          </div>
        </div>

        {/* Right section with more options and user icon */}
        <div className="flex items-center space-x-4">
          {/* <HiOutlineDotsVertical className="text-2xl text-gray-500 cursor-pointer" /> */}
          <AiOutlineUser   onClick={handleUserIconClick} className="text-3xl text-blue-600 cursor-pointer" />
        </div>
      </div>
      {showAttendance && (
        attendanceData ? (
          <div className="mt-8 bg-white p-6 rounded-lg shadow-inner">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
              <h3 className="text-xl font-semibold text-blue-800">
                Attendance Details:
              </h3>
              <div className="flex items-center mt-4 md:mt-0">
                <span className="text-lg font-semibold text-gray-700 mr-2">
                  Attendance Percentage:
                </span>
                <span className="text-xl font-bold text-blue-700">
                  {parseFloat(attendanceData.attendance_percentage).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 text-center text-gray-500">
            <p>No attendance data available for this classroom.</p>
          </div>
        )
      )}
    
      {/* Search Filter */}
      <input
        type="text"
        placeholder="Search by student name or college ID"
        value={searchTerm}
        onChange={handleSearch}
        className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
      />

      <ul>
        {filteredSubmissions.map((submission) => (
          <li key={submission.submission_id} className="mb-4 p-4 bg-white rounded-lg shadow-md">
            <div className="flex flex-col mb-2">
              <p><strong>Student Name:</strong> {submission.student_name}</p>
              <p><strong>College ID:</strong> {submission.stud_clg_id}</p>
              <p>
                <strong>Submitted At:</strong>{' '}
                {submission.submitted_at ? new Date(submission.submitted_at).toLocaleString() : 'Not Uploaded'}
              </p>
              <p><strong>Is Late:</strong> {submission.is_late ? 'Yes' : 'No'}</p>
              <div className="flex items-center mb-2">
                <label className="mr-2"><strong>Marks:</strong></label>
                <input
                  type="text"
                  value={submission.marks !== null ? submission.marks : ''}
                  onChange={(e) => handleMarksChange(submission.submission_id, e.target.value)}
                  className="w-16 p-1 border border-gray-300 rounded"
                />
                <button
                  className="ml-2 bg-green-500 text-white px-2 py-1 rounded"
                  onClick={() => saveMarks(submission.submission_id, submission.marks)}
                >
                  Save
                </button>
              </div>
              <p><strong>Message to Teacher:</strong> {submission.message_to_teacher}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {submission.files.length > 0 ? (
                submission.files.map((file) => (
                  <div key={file.file_id} className="border p-2 rounded-md">
                    <p><strong>File Name:</strong> {file.file_name}</p>
                    <p><strong>File Type:</strong> {file.file_type}</p>
                    <p><strong>File Size:</strong> {(file.file_size / 1024).toFixed(2)} KB</p>
                    <button
                      className="bg-blue-500 text-white p-2 rounded mt-2"
                      onClick={() => handleDownload(file.file_id, file.file_name)}
                    >
                      Download
                    </button>
                  </div>
                ))
              ) : (
                <p>No files uploaded</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AssignmentSubmissions;
