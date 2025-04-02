import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../api';

const AdminSideEditCourse = () => {
  const { usercourse_id } = useParams(); // Get course ID from URL
  const navigate = useNavigate();
  const [courseid, setCourseId] = useState(0);
  const [courseName, setCourseName] = useState('');
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState('');
  const [cocount, setCoCount] = useState(0);
  const [academicYear, setAcademicYear] = useState('');
  const [branches, setBranches] = useState([]); // For branch dropdown

  // Branch mapping object
  const branchMapping = {
    1: 'COMPUTER',
    2: 'IT',
    3: 'AIDS',
    4: 'AIML',
    5: 'MECATRONICS',
  };

  // Fetch course details by ID
  const fetchCourseDetails = async () => {
    try {
      const response = await api.get(`/api/usercourse/specific/${usercourse_id}`);
      const course = response.data[0];
      console.log(course);
      setCourseId(course.courseid);
      setCourseName(course.course_name);
      setBranch(course.branch);  // This is the branch ID
      setSemester(course.semester);
      setCoCount(course.co_count);
      setAcademicYear(course.academic_year);
    } catch (error) {
      console.error('Error fetching Course details:', error);
    }
  };

  // Fetch branches for dropdown
  const fetchBranches = async () => {
    try {
      const response = await api.get('/api/branch/show');
      setBranches(response.data); // Assume this API returns a list of branches
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
    fetchBranches();
  }, [usercourse_id]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("usercourse_id",usercourse_id)
    try {
      await api.put(`/api/usercourse/edit/specific/${usercourse_id}`, {
        courseid,
        usercourse_id,
        course_name: courseName,
        branch,
        semester,
        cocount,
        academic_year: academicYear,
      });
      console.log("Updated Course")
      navigate('/usercourse'); // Redirect to Manage Courses page
    } catch (error) {
      console.error('Error updating Course:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Edit Course</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2">Course Name</label>
          <input
            type="text"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Branch</label>
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
            required
          >
            <option value="" disabled>Select Branch</option>
            {/* Map over the branchMapping object */}
            {Object.keys(branchMapping).map((key) => (
              <option key={key} value={key}>
                {branchMapping[key]}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-2">Semester</label>
          <input
            type="number"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
            required
          />
        </div>
        {/* <div className="mb-4">
          <label className="block mb-2">CO Count</label>
          <input
            type="text"
            value={cocount}
            onChange={(e) => setCoCount(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
            required
          />
        </div> */}
        <div className="mb-4">
          <label className="block mb-2">Academic Year</label>
          <input
            type="text"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
            required
          />
        </div>
        <button type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded">
          Update Course
        </button>
      </form>
    </div>
  );
};

export default AdminSideEditCourse;
