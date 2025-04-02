import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../../api.js';
import { FaTrashAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const ManageCohortStudents = () => {
  const { cohortId } = useParams();
  const cohortIdAsInt = parseInt(cohortId, 10);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [cohortname, setCohortName] = useState();
  const [initialCohortStudents, setInitialCohortStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSearchTerm, setSelectedSearchTerm] = useState(''); // Search term for selected students
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [uniqueBranches, setUniqueBranches] = useState([]);
  const [uniqueYears, setUniqueYears] = useState([]);
  const [filters, setFilters] = useState({
    branch: '',
    academicYear: '',
    semester: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 25;

  useEffect(() => {
    const fetchCohortName = async () => {
      try {
        const response = await api.get(`/api/cohorts/cohortname/${cohortIdAsInt}`);
        setCohortName(response.data[0].cohort_name);
      } catch (error) {
        console.error('Error fetching cohort students:', error);
      }
    };
    fetchCohortName();
  }, [cohortIdAsInt]);

  useEffect(() => {
    const fetchCohortStudents = async () => {
      try {
        const response = await api.get(`/api/cohorts/cohortstudents/${cohortIdAsInt}`);
        setInitialCohortStudents(response.data);
        setSelectedStudents(response.data);
      } catch (error) {
        console.error('Error fetching cohort students:', error);
      }
    };
    fetchCohortStudents();
  }, [cohortIdAsInt]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/api/cohorts/getallstudents');
        setStudents(response.data);
        setFilteredStudents(response.data);
        const branches = [...new Set(response.data.map(student => student.branch))];
        const years = [...new Set(response.data.map(student => student.academic_year))];
        setUniqueBranches(branches);
        setUniqueYears(years); 
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };
    fetchStudents();
  }, []);

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
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, filters, students]);

  // Filter selected students based on the search term in the "Selected Students" section
  const filteredSelectedStudents = selectedStudents.filter((student) =>
    student.student_name.toLowerCase().includes(selectedSearchTerm.toLowerCase())
  );

  const handleSelectStudent = (student) => {
    setSelectedStudents((prevSelected) =>
      prevSelected.some(s => s.sid === student.sid)
        ? prevSelected.filter((s) => s.sid !== student.sid)
        : [...prevSelected, student]
    );
  };

  const handleRemoveStudent = async (student) => {
    try {
      await api.delete(`/api/cohorts/removestudent/${cohortIdAsInt}/${student.sid}`);
      setSelectedStudents((prevSelected) => prevSelected.filter((s) => s.sid !== student.sid));
      Swal.fire('Removed', 'Student removed successfully', 'success');
    } catch (error) {
      console.error('Error removing student:', error);
      Swal.fire('Error', 'Error while removing the student', 'error');
    }
  };

  const getNewlySelectedStudents = () => {
    return selectedStudents.filter(
      (student) => !initialCohortStudents.some((initial) => initial.sid === student.sid)
    );
  };

  const handleAddNewStudents = async () => {
    const newStudents = getNewlySelectedStudents();
    if (newStudents.length === 0) {
      Swal.fire('Info', 'No new students to add', 'info');
      return;
    }
    try {
      await api.post(`/api/cohorts/assignstudents/${cohortIdAsInt}`, {
        selectedStudents: newStudents.map(student => student.sid),
      });
      setInitialCohortStudents((prev) => [...prev, ...newStudents]);
      Swal.fire('Success', 'New students added successfully', 'success');
    } catch (error) {
      console.error('Error assigning new students:', error);
      Swal.fire('Error', 'Error while adding new students', 'error');
    }
  };

  const handleDeleteAll = async () => {
    try {
      await api.delete(`/api/cohorts/deletestudents/${cohortIdAsInt}`);
      setSelectedStudents([]);
      Swal.fire('Removed', 'All students removed from the cohort successfully', 'success');
    } catch (error) {
      console.error('Error deleting all students:', error);
      Swal.fire('Error', 'Error while deleting students', 'error');
    }
  };

  const handleSubmit = async () => {
    try {
      await api.post(`/api/cohorts/assignstudents/${cohortIdAsInt}`, {
        selectedStudents: selectedStudents.map(student => student.sid),
      });
      Swal.fire('Submitted', 'All selected students submitted successfully', 'success');
    } catch (error) {
      console.error('Error submitting students:', error);
      Swal.fire('Error', 'Error while submitting students', 'error');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
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
          // Stop adding if the limit of 200 students is reached
          if (count < maxSelection && !newSelected.some((s) => s.sid === student.sid)) {
            newSelected.push(student);
            count++;
          }
        });
  
        return newSelected;
      });
    }
  };
  

  // Pagination Logic
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-4 left-0 z-45 w-full mt-8">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">{cohortname}</h1>
      <div className="flex flex-col lg:flex-row lg:space-x-4">
        <div className="w-full lg:w-1/3 p-4 border border-gray-300 rounded-lg mb-4 lg:mb-0">
          <h2 className="text-xl font-bold mb-4">Selected Students</h2>
          
          {/* Search box for selected students */}
          <input
            type="text"
            placeholder="Search selected students"
            value={selectedSearchTerm}
            onChange={(e) => setSelectedSearchTerm(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full mb-4"
          />
          
          <button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 mb-4 rounded w-full"
          >
            Submit All Selected Students
          </button>
          <button
            onClick={handleAddNewStudents}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 mb-4 rounded w-full"
          >
            Add Newly Selected Students
          </button>
          <button
            onClick={handleDeleteAll}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 mb-4 rounded w-full"
          >
            Delete All Students
          </button>
          <ul>
            {filteredSelectedStudents.map((student) => (
              <li key={student.sid} className="border-b py-2 flex items-center justify-between">
                <span>{student.student_name}</span>
                <FaTrashAlt
                  className="text-red-500 cursor-pointer"
                  onClick={() => handleRemoveStudent(student)}
                />
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full lg:w-2/3 p-4 border border-gray-300 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Manage Students</h2>
          <input
            type="text"
            placeholder="Search by name, ID, or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full mb-4"
          />
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
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
                name="semester"
                min={1}
                max={8}
                onChange={handleFilterChange}
                className="border border-gray-300 p-1.5 rounded w-full"
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

export default ManageCohortStudents;
