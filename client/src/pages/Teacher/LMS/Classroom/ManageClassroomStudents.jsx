import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // To get classId from the URL
import api from '../../../../api.js';
import { FaTrashAlt } from 'react-icons/fa';  // Importing trash icon for removing students

const ManageClassroomStudents = ({ uid }) => {
  const { classId } = useParams(); // Get classroomId from the URL
  const classIdAsInt = parseInt(classId, 10);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [classCohorts, setClassCohorts] = useState([]);
  const [initialCohortStudents, setInitialCohortStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [uniqueBranches, setUniqueBranches] = useState([]);
  const [uniqueYears, setUniqueYears] = useState([]);
  const [filters, setFilters] = useState({
    branch: '',
    academicYear: '',
    semester: '',
  });
  const [selectedCohorts, setSelectedCohorts] = useState([]); // State to track selected cohorts
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch cohorts based on userId
  useEffect(() => {
    const fetchCohorts = async () => {
      try {
        const response = await api.get(`/api/lmsclassroom/fetchcohorts/${uid}`);
        setClassCohorts(response.data);
      } catch (error) {
        console.error('Error fetching cohorts:', error);
        setErrorMessage('Failed to fetch students. Please try again later.');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    };

    fetchCohorts();
  }, [uid]);

  console.log(classId)

  useEffect(() => {
    const fetchClassroomStudents = async () => {
      try {
        const response = await api.get(`/api/lmsclassroom/fetchstudents/${classIdAsInt}`); // Update the API endpoint as needed
        setInitialCohortStudents(response.data); // Set initial students
        setSelectedStudents(response.data); // Set initially selected students
      } catch (error) {
        const message = error.response?.data?.message || error.response?.statusText || 'Error fetching classroom students. Please try again.';
        setErrorMessage(message);
        setTimeout(() => setErrorMessage(''), 5000);
        console.error('Error fetching classroom students:', error);
      }
      console.log(typeof classIdAsInt);
    };

    fetchClassroomStudents();
  }, [classIdAsInt]); // Dependencies array to fetch new data when classId changes
  // Fetch all students for cohort assignment

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/api/cohorts/getallstudents');
        setStudents(response.data);
        setFilteredStudents(response.data);
        // Extract unique branches and academic years
        const branches = [...new Set(response.data.map(student => student.branch))];
        const years = [...new Set(response.data.map(student => student.academic_year))];
        setUniqueBranches(branches);
        setUniqueYears(years);
      } catch (error) {
        console.error('Error fetching students:', error);
        setErrorMessage('Failed to fetch cohorts. Please try again later.');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    };

    fetchStudents();
  }, []);

  // Filter students based on search and filter criteria
  useEffect(() => {
    const filtered = students.filter((student) => {
      const matchesSearchTerm = student.student_name.toLowerCase().includes(searchTerm.toLowerCase())
        || student.stud_clg_id.toLowerCase().includes(searchTerm.toLowerCase())
        || student.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBranch = filters.branch ? student.branch === filters.branch : true;
      const matchesAcademicYear = filters.academicYear ? student.academic_year === filters.academicYear : true;
      const matchesSemester = filters.semester ? student.semester === parseInt(filters.semester, 10) : true;

      return matchesSearchTerm && matchesBranch && matchesAcademicYear && matchesSemester;
    });

    setFilteredStudents(filtered);
  }, [searchTerm, filters, students]);

  // Select or deselect a student
  const handleSelectStudent = (student) => {
    setSelectedStudents((prevSelected) =>
      prevSelected.some(s => s.sid === student.sid)
        ? prevSelected.filter((s) => s.sid !== student.sid)
        : [...prevSelected, student]
    );
  };

  // Remove student from selected list
  const handleRemoveStudent = async (student) => {
    try {
      // Convert student ID to an integer
      const sid = parseInt(student.sid, 10);

      // Delete the student from the database for this classroom
      await api.delete(`/api/lmsclassroom/deletestudent/${sid}/${classIdAsInt}/${uid}`);

      // Log student ID and class ID to verify their types
      console.log(`Student ID: ${sid}, Type: ${typeof sid}`);
      console.log(`Class ID: ${classIdAsInt}, Type: ${typeof classIdAsInt}`);
      

      // Remove the student from the selected list
      setSelectedStudents((prevSelected) =>
        prevSelected.filter((s) => s.sid !== student.sid)
      );

      alert('Student removed successfully');
    } catch (error) {
      console.error('Error removing student:', error);
      console.log(error)
      alert('Error while removing the student');
      // setErrorMessage('Error while removing the student. Please try again.');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  // Add newly selected students from selected cohorts to the cohort
  const handleAddNewStudents = async () => {
    const newStudents = selectedStudents.filter(
      (student) => !initialCohortStudents.some((initial) => initial.sid === student.sid)
    );
    if (newStudents.length === 0) {
      alert('No new students to add');
      return;
    }
    try {
      api.post(`/api/lmsclassroom/assignstudents/${classIdAsInt}`, {
        selectedStudents: newStudents.map(student => student.sid),
        t_id:uid
      });
      alert('New students added successfully');
      setInitialCohortStudents((prev) => [...prev, ...newStudents]);
    } catch (error) {
      console.error('Error assigning new students:', error);
      alert('Error while adding new students');
      setErrorMessage('Error while adding new students. Please try again.');
      setTimeout(() => setErrorMessage(''), 5000);

    }
  };

  // Handle cohort selection change
  const handleCohortChange = (e) => {
    const { options } = e.target;
    const selectedCohortIds = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);

    setSelectedCohorts(selectedCohortIds);
    console.log(selectedCohorts)
    // Fetch students from selected cohorts
    const fetchCohortStudents = async () => {
      try {
        const cohortStudents = await Promise.all(selectedCohortIds.map(cohortId =>
          api.get(`/api/cohorts/cohortstudents/${cohortId}`)
        ));

        // Combine students and avoid duplicates
        const allCohortStudents = cohortStudents.flatMap(res => res.data);
        const uniqueStudents = Array.from(new Set(allCohortStudents.map(s => s.sid)))
          .map(sid => allCohortStudents.find(s => s.sid === sid));

        setStudents(uniqueStudents);
        setFilteredStudents(uniqueStudents);
      } catch (error) {
        console.error('Error fetching cohort students:', error);
        setErrorMessage('Failed to fetch cohort students. Please try again.');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    };

    fetchCohortStudents();
  };

  const handleSelectAll = () => {
    const maxSelection = 200;
    
    if (selectedStudents.length === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedStudents((prevSelected) =>
        prevSelected.filter(
          (s) => !filteredStudents.some((filteredStudent) => filteredStudent.sid === s.sid)
        )
      );
    } else {
      setSelectedStudents((prevSelected) => {
        const newSelected = [...prevSelected];
        let count = newSelected.length;
        
        filteredStudents.forEach((student) => {
          if (count < maxSelection && !newSelected.some((s) => s.sid === student.sid)) {
            newSelected.push(student);
            count++;
          }
        });
        
        return newSelected;
      });
    }
  };
  
  console.log(selectedStudents)
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const handleDeleteAll = async () => {
    try {
      api.delete(`/api/lmsclassroom/deletestudents/${classIdAsInt}/${uid}`);
      setSelectedStudents([]); // Clear the selected students list
      alert('All students removed from the cohort successfully');
    } catch (error) {
      console.error('Error deleting all students:', error);
      alert('Error while deleting students');
      setErrorMessage('Error while deleting students. Please try again.');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 25;

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className='left-0 z-45 w-full mt-8'>
      <h1 className="text-3xl font-bold text-center text-blue-600">Manage Classroom Students</h1>
      {/* Display Error Message */}
      {errorMessage && (
        <div className="bg-red-500 text-white p-4 mb-4 rounded">
          {errorMessage}
        </div>
      )}
      <div className="flex container mx-auto p-4">
        {/* Left: Selected students */}
        <div className="w-1/3 p-4 border border-gray-300 rounded-lg mr-4">
          <h2 className="text-xl font-bold mb-4">Selected Students</h2>

          <button
            onClick={handleAddNewStudents}
            className="bg-green-500 text-white px-4 py-2 mb-4 rounded"
          >
            Add Newly Selected Students
          </button>
          <button
            onClick={handleDeleteAll}
            className="bg-red-500 text-white px-4 py-2 mb-4 rounded"
          >
            Delete All Students
          </button>

          <ul>
            {selectedStudents.map((student) => (
              <li key={student.sid} className="border-b py-2 flex items-center justify-between">
                <span>{student.student_name}</span>
                { student.t_id == uid ? (<FaTrashAlt
                  className="text-red-500 cursor-pointer"
                  onClick={() => handleRemoveStudent(student)}
                />):(
                  <></>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Manage students */}
        <div className="w-2/3 p-4 border border-gray-300 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Manage Students</h2>

          {/* Cohorts Multi-Select */}
          <div className="mb-4">
            <label className="block mb-2">Select Cohorts</label>
            <select multiple onChange={handleCohortChange} className="border border-gray-300 p-2 rounded w-full">
              {classCohorts.map((cohort) => (
                <option key={cohort.cohort_id} value={cohort.cohort_id}>
                  {cohort.cohort_name}
                </option>
              ))}
            </select>
          </div>

          {/* Search input */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by name, ID, or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 p-2 rounded w-full"
            />
          </div>

          {/* Filters */}
          <div className="mb-4 grid grid-cols-3 gap-4">
            <div>
              <label className="block mb-2">Branch</label>
              <select name="branch" onChange={handleFilterChange} className="border border-gray-300 p-2 rounded w-full">
                <option value="">All Branches</option>
                {uniqueBranches.map((branch, index) => (
                  <option key={index} value={branch}>{branch}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2">Academic Year</label>
              <select name="academicYear" onChange={handleFilterChange} className="border border-gray-300 p-2 rounded w-full">
                <option value="">All Years</option>
                {uniqueYears.map((year, index) => (
                  <option key={index} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2">Semester</label>
              <input
                type="number"
                min={0}
                max={8}
                name="semester"
                onChange={handleFilterChange}
                className="border border-gray-300 p-2 rounded w-full"
              />
            </div>
          </div>
          <div className="mb-4">
            <label>
              <input
                type="checkbox"
                checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                onChange={handleSelectAll}
                className="mr-2"
              />
              Select All Listed Students
            </label>
          </div>

         <div className="overflow-x-auto">
            <table className="table-auto w-full text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-2">Select</th>
                  <th className="px-4 py-2">Student ID</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Branch</th>
                  <th className="px-4 py-2">Semester</th>
                  <th className="px-4 py-2">Academic Year</th>
                </tr>
              </thead>
              <tbody>
                {currentStudents.map((student) => (
                  <tr key={student.sid}>
                    <td className="border px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedStudents.some(s => s.sid === student.sid)}
                        onChange={() => handleSelectStudent(student)}
                      />
                    </td>
                    <td className="border px-4 py-2">{student.stud_clg_id}</td>
                    <td className="border px-4 py-2">{student.student_name}</td>
                    <td className="border px-4 py-2">{student.email}</td>
                    <td className="border px-4 py-2">{student.branch}</td>
                    <td className="border px-4 py-2">{student.semester}</td>
                    <td className="border px-4 py-2">{student.academic_year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center mt-4 space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-gray-300 text-gray-600 px-4 py-2 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-gray-300 text-gray-600 px-4 py-2 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ManageClassroomStudents;
