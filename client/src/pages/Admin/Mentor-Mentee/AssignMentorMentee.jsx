import React, { useEffect, useState } from "react";
import api from "../../../api";
import Pagination from "../../../components/Pagination/Pagination";
import { FaUserGraduate, FaChalkboardTeacher, FaSearch, FaUsers, FaUserPlus, FaSpinner, FaFilter } from "react-icons/fa";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AssignMentorMentee = ({ uid }) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [branchdata, setBranchdata] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(0);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState("");
  const [year, setYear] = useState("");
  const [groupName, setGroupName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const studentsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/users/`);
        const res1 = await api.get(`/api/branch/show`);
        const res2 = await api.get(`/api/users/depart/${uid}`);
        const res3 = await api.post(`/api/mentormentee/admin/students/${uid}`);
        
        setUsers(res.data);
        setBranchdata(res1.data);
        setSelectedBranch(res2.data[0].depart);
        setStudents(res3.data);
        setFilteredStudents(res3.data);
        
        // Filter teachers based on selected branch
        setFilteredTeachers(res.data.filter(teacher => teacher.depart === res2.data[0].depart));
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [uid]);

  useEffect(() => {
    // Filter students based on search term
    if (searchTerm.trim() === "") {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(
        student =>
          student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.stud_clg_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchTerm, students]);

  const handleStudentSelection = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  const handleAssign = async () => {
    if (!selectedTeacher || selectedStudents.length === 0 || !academicYear || !semester || !year || !groupName) {
      toast.warning("Please fill in all fields and select a teacher and at least one student.");
      return;
    }
    
    try {
      setSubmitting(true);
      await api.post("/api/mentormentee/admin/assign-mentor", {
        teacherId: selectedTeacher,
        studentIds: selectedStudents,
        academicYear,
        semester,
        year,
        groupName
      });
      toast.success("Mentor assigned successfully!");
      
      // Reset form after successful submission
      setSelectedStudents([]);
      setSelectedTeacher("");
      setAcademicYear("");
      setSemester("");
      setYear("");
      setGroupName("");
    } catch (err) {
      console.error("Error assigning mentor:", err);
      toast.error("Failed to assign mentor. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getBranchName = (branchId) => {
    // Handle both numeric IDs and string names
    if (typeof branchId === 'number') {
      // If branchId is a number, find by idbranch
      const branch = branchdata.find(b => b.idbranch === branchId);
      return branch ? branch.branchname : "Unknown";
    } else if (typeof branchId === 'string') {
      // If branchId is already a string name like "Computer", return it directly
      // Or optionally, verify it exists in your branch data
      const branch = branchdata.find(b => b.branchname === branchId);
      return branch ? branch.branchname : branchId;
    }
    return "Unknown";
  };

  const getTeacherName = (teacherId) => {
    const teacher = filteredTeachers.find(t => t.userid === teacherId);
    return teacher ? teacher.teacher_name : "Unknown";
  };

  return (
    <div 
      className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8"
    >
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mt-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8">
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-4">
                <FaUsers className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Assign Mentor-Mentee
                </h1>
                <p className="text-blue-100">
                  Create mentor-mentee groups and assign students to teachers
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {false ? (
              <div className="flex justify-center items-center py-20">
                <FaSpinner className="animate-spin text-blue-500 text-4xl" />
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Panel - Form */}
                <div className="lg:w-1/3 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <FaUserPlus className="mr-2 text-blue-500" />
                    Create Mentor Group
                  </h2>
                  
                  <div className="space-y-4">
                    {/* Teacher Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Select Teacher:</label>
                      <div className="relative">
                        <FaChalkboardTeacher className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <select
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={selectedTeacher}
                          onChange={(e) => setSelectedTeacher(e.target.value)}
                        >
                          <option value="">-- Select Teacher --</option>
                          {filteredTeachers.map((teacher) => (
                            <option key={teacher.id} value={teacher.userid}>
                              {teacher.teacher_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Academic Year */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year:</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 2023-2024"
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                      />
                    </div>

                    {/* Semester */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Semester:</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                      >
                        <option value="">-- Select Semester --</option>
                        {[...Array(8)].map((_, i) => (
                          <option key={i} value={i + 1}>
                            Semester {i + 1}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Year (FE, SE, TE, BE, DSE) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year:</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                      >
                        <option value="">-- Select Year --</option>
                        <option value="FE">First Year (FE)</option>
                        <option value="SE">Second Year (SE)</option>
                        <option value="TE">Third Year (TE)</option>
                        <option value="BE">Final Year (BE)</option>
                        <option value="DSE">Direct Second Year (DSE)</option>
                      </select>
                    </div>

                    {/* Group Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Group Name:</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Group A"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* Selected Students Summary */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                      <FaUserGraduate className="mr-2 text-blue-500" />
                      Selected Students ({selectedStudents.length})
                    </h3>
                    
                    {selectedStudents.length > 0 ? (
                      <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                        <ul className="divide-y divide-gray-200">
                          {selectedStudents.map((id) => {
                            const student = students.find((s) => s.sid === id);
                            return (
                              <li key={id} className="p-3 hover:bg-gray-50 flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-gray-800">{student?.student_name}</p>
                                  <p className="text-sm text-gray-500">{student?.stud_clg_id}</p>
                                </div>
                                <button 
                                  onClick={() => handleStudentSelection(id)} 
                                  className="text-red-500 hover:bg-red-50 p-1 rounded-full"
                                >
                                  ✖
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ) : (
                      <div className="text-center py-4 border border-gray-200 rounded-lg bg-gray-50">
                        <p className="text-gray-500">No students selected</p>
                        <p className="text-sm text-gray-400">Select students from the table</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Assign Button */}
                  <button
                    onClick={handleAssign}
                    disabled={submitting}
                    className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:bg-gray-400 flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <FaUserPlus className="mr-2" />
                        Assign Mentor
                      </>
                    )}
                  </button>
                </div>
                
                {/* Right Panel - Student Selection */}
                <div className="lg:w-2/3 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <FaUserGraduate className="mr-2 text-blue-500" />
                    Select Students
                  </h2>
                  
                  {/* Search and Filter */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-grow">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <label className="mr-2 text-sm font-medium text-gray-700">Select All</label>
                      <input
                                                type="checkbox"
                                                onChange={(e) =>
                                                  setSelectedStudents(e.target.checked ? students.map((s) => s.sid) : [])
                                                }
                                                checked={selectedStudents.length === students.length && students.length > 0}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                              />
                                            </div>
                                          </div>
                                          
                                          {/* Students Table */}
                                          <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                            <table className="min-w-full divide-y divide-gray-200">
                                              <thead className="bg-gray-50">
                                                <tr>
                                                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Select
                                                  </th>
                                                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Student ID
                                                  </th>
                                                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Name
                                                  </th>
                                                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Branch
                                                  </th>
                                                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Semester
                                                  </th>
                                                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Academic Year
                                                  </th>
                                                </tr>
                                              </thead>
                                              <tbody className="bg-white divide-y divide-gray-200">
                                                {currentStudents.map((student) => (
                                                  <tr 
                                                    key={student.sid} 
                                                    className={`hover:bg-blue-50 transition-colors ${selectedStudents.includes(student.sid) ? 'bg-blue-50' : ''}`}
                                                    onClick={() => handleStudentSelection(student.sid)}
                                                  >
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                      <input
                                                        type="checkbox"
                                                        checked={selectedStudents.includes(student.sid)}
                                                        onChange={() => handleStudentSelection(student.sid)}
                                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                      />
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                      {student.stud_clg_id}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                      {student.student_name}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                      {getBranchName(student.branch)}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                      {student.semester}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                      {student.academic_year}
                                                    </td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                          
                                          {/* Pagination */}
                                          <div className="mt-4">
                                            <Pagination
                                              currentPage={currentPage}
                                              totalPages={Math.ceil(filteredStudents.length / studentsPerPage)}
                                              onPageChange={setCurrentPage}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Footer */}
                                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                                    <div className="flex flex-wrap justify-between text-sm text-gray-600">
                                      <div>Department: <span className="font-semibold">{getBranchName(selectedBranch)}</span></div>
                                      <div>Total Students: <span className="font-semibold">{students.length}</span></div>
                                      <div>Selected: <span className="font-semibold">{selectedStudents.length}</span></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        };
                        
                        export default AssignMentorMentee;