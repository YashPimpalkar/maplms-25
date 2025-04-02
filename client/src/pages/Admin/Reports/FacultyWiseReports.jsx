import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api";
import { FaChalkboardTeacher, FaCalendarAlt, FaSearch, FaSpinner, FaChevronRight, FaUniversity, FaUserGraduate } from "react-icons/fa";
import { motion } from "framer-motion";

const FacultyWiseReports = ({ uid }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [userdata, setUserData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const tableRefs = useRef([]);
  const navigate = useNavigate();

  const addToRefs = (el) => {
    if (el && !tableRefs.current.includes(el)) {
      tableRefs.current.push(el);
    }
  };

  // Fetch academic years on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/users/getacademicyear/${uid}`);
        setData(res.data);
        if (res.data.length > 0) {
          setSelectedYear(res.data[0].academic_year);
        }
      } catch (err) {
        console.error("Error fetching academic years:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uid]);

  // Fetch course data whenever selectedYear changes
  useEffect(() => {
    if (!selectedYear) return;

    const CourseChange = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/reports/getuserbybranch/${uid}`, {
          params: { selectedYear },
        });
        setUserData(res.data);
        
        // Extract unique departments
        const uniqueDepartments = [...new Set(res.data.map(user => user.depart))];
        setDepartments(uniqueDepartments);
      } catch (err) {
        console.error("Error fetching course data:", err);
      } finally {
        setLoading(false);
      }
    };

    CourseChange();
  }, [selectedYear, uid]);

  // Handle click to navigate to user details
  const handleUserClick = (userid, depart, teacher_name) => {
    navigate("/userwisedetails", { state: { userid, selectedYear, depart, teacher_name } });
  };

  // Filter faculty based on search term and selected department
  const filteredFaculty = userdata.filter(user => {
    const matchesSearch = user.teacher_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === "" || user.depart === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  return (
    <div 
      className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mt-5">
          {/* Header */}
          <div className="bg-gradient-to-r bg-indigo-700 px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <FaChalkboardTeacher className="text-white text-3xl mr-4" />
                <h1 className="text-2xl font-bold text-white">
                  Faculty Wise Reports
                </h1>
              </div>
              
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" />
                <select
                  id="academicYear"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white bg-opacity-20 text-white rounded-lg border border-purple-400 focus:outline-none focus:ring-2 focus:ring-white appearance-none"
                  disabled={loading}
                >
                  <option value="" disabled>
                    -- Select Academic Year --
                  </option>
                  {data.map((item, index) => (
                    <option key={index} value={item.academic_year} className="text-gray-800">
                      {item.academic_year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="mt-4 text-center text-purple-100">
              View and analyze faculty performance across different departments
            </p>
          </div>

          {/* Filters Section */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search Filter */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaSearch className="mr-2 text-purple-500" />
                  Search Faculty
                </label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    className="pl-10 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                    placeholder="Search by faculty name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Department Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaUniversity className="mr-2 text-purple-500" />
                  Department
                </label>
                <select
                  className="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {departments.map((dept, index) => (
                    <option key={index} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Faculty Cards */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <FaSpinner className="animate-spin text-purple-500 text-4xl" />
              </div>
            ) : filteredFaculty.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFaculty.map((user, index) => (
                  <div
                    key={index}
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                    onClick={() => handleUserClick(user.userid, user.depart, user.teacher_name)}
                  >
                    <div className="bg-purple-100 px-4 py-3 border-b border-purple-200">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-purple-200 flex items-center justify-center">
                          <FaUserGraduate className="text-purple-600 text-xl" />
                        </div>
                        <div className="ml-4">
                          <h2 className="text-lg font-semibold text-gray-800 truncate">
                            {user.teacher_name}
                          </h2>
                          <p className="text-sm text-gray-500">ID: {user.userid}</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        {/* <div className="text-sm text-gray-600">
                          <span className="font-medium">Department:</span> {user.depart || "Not specified"}
                        </div> */}
                        <FaChevronRight className="text-purple-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <FaSearch className="mx-auto text-gray-300 text-5xl mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No faculty found</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {selectedYear 
                    ? "No faculty members match your search criteria. Try adjusting your filters."
                    : "Please select an academic year to view faculty members."}
                </p>
              </div>
            )}
          </div>

          {/* Stats Footer */}
          {filteredFaculty.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex flex-wrap justify-between text-sm text-gray-600">
                <div>Total Faculty: <span className="font-semibold">{filteredFaculty.length}</span></div>
                <div>Departments: <span className="font-semibold">{departments.length}</span></div>
                <div>Academic Year: <span className="font-semibold">{selectedYear}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyWiseReports;