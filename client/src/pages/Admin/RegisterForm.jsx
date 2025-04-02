import React, { useEffect, useState } from "react";
import api from "../../api";
import { FaUserPlus, FaUserMinus, FaSearch, FaSpinner, FaCheckCircle, FaExclamationCircle, FaGraduationCap, FaCalendarAlt, FaCodeBranch, FaBook } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function RegistrationForm({ uid }) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [users, setUsers] = useState([]);
  const [branchdata, setBranchdata] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState([
    {
      user_ids: [], // Stores multiple selected teachers
      course_code: "",
      sem: "",
      academic_year: "",
      branch: selectedBranch || "",
      teacher_name: "",
    },
  ]);

  useEffect(() => {
    if (selectedBranch && branchdata) {
      setFormData((prevData) =>
        prevData.map((course) => ({
          ...course,
          branch: selectedBranch || "Branch not found", // Assign as a string
        }))
      );
    }
  }, [selectedBranch, branchdata]);

  // Fetch users & branches data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const res = await api.get(`/api/users/`);
        const res1 = await api.get(`/api/branch/show`);
        const res2 = await api.get(`/api/users/depart/${uid}`);
        setUsers(res.data);
        setBranchdata(res1.data);
        setSelectedBranch(res2.data[0].depart);
      } catch (err) {
        console.error("Error fetching data:", err);
        setErrorMessage("Failed to load data. Please refresh the page.");
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [uid]);

  // Handle form field changes
  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const updatedFormData = [...formData];
    updatedFormData[index] = { ...updatedFormData[index], [name]: value };
    setFormData(updatedFormData);
  };

  // Filter teachers by branch and name
  const getFilteredUsers = () => {
    return users.filter(
      (user) =>
        user.depart == selectedBranch &&
        user.teacher_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Add teacher to selected list
  const addTeacher = (index, userId, teacherName) => {
    setFormData((prev) => {
      const newData = [...prev];
      if (!newData[index].user_ids.some((t) => t.id === userId)) {
        newData[index].user_ids.push({ id: userId, name: teacherName });
      }
      return newData;
    });
  };

  // Remove teacher from selected list
  const removeTeacher = (index, userId) => {
    setFormData((prev) => {
      const newData = [...prev];
      newData[index].user_ids = newData[index].user_ids.filter(
        (t) => t.id !== userId
      );
      return newData;
    });
  };

  // Handle form submission
  const handleProceedClick = async () => {
    if (handleValidation()) {
      try {
        setLoading(true);
        const response = await api.post(`/api/usercourse/admin/add`, {
          formData,
        });
        console.log("Successfully updated record:", response.data);
        setIsSubmitted(true);
        setErrorMessage("");
      } catch (error) {
        setErrorMessage(
          error.response?.data?.error ||
            "There was an error saving the registration."
        );
      } finally {
        setLoading(false);
      }
    }
  };

  // Validate form fields
  const handleValidation = () => {
    const requiredFields = ["course_code", "sem", "academic_year", "branch"];
    for (const course of formData) {
      for (let field of requiredFields) {
        if (!course[field] || course[field].toString().trim() === "") {
          setErrorMessage(`Please fill in the ${field.replace('_', ' ')} field for all courses.`);
          return false;
        }
      }
      
      if (course.user_ids.length === 0) {
        setErrorMessage("Please select at least one teacher.");
        return false;
      }
    }
    setErrorMessage("");
    return true;
  };

  // Generate academic years list
  const generateYearList = () => {
    const currentYear = new Date().getFullYear();
    return Array.from(
      { length: 8 },
      (_, i) => `${currentYear - i}-${currentYear - i + 1}`
    );
  };
  const yearList = generateYearList();

  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-500 text-4xl mx-auto mb-4" />
          <p className="text-gray-600">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mt-5">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8">
            <div className="flex items-center justify-center">
              <FaGraduationCap className="text-white text-4xl mr-4" />
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Course Assignment
              </h1>
            </div>
            <p className="mt-2 text-center text-blue-100">
              Assign teachers to courses for {branchdata.find(branch => branch.idbranch === selectedBranch)?.branchname || "your department"}
            </p>
          </div>

          <div className="p-6 md:p-8">
            <AnimatePresence>
              {errorMessage && (
                <div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md"
                >
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FaExclamationCircle className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{errorMessage}</p>
                    </div>
                  </div>
                </div>
              )}
            </AnimatePresence>

            {isSubmitted ? (
              <div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h2>
                <p className="text-gray-600 mb-6">The course has been successfully assigned to the selected teachers.</p>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData([{
                      user_ids: [],
                      course_code: "",
                      sem: "",
                      academic_year: "",
                      branch: selectedBranch || "",
                      teacher_name: "",
                    }]);
                  }}
                  className="bg-blue-500 text-white rounded-md px-6 py-2 hover:bg-blue-600 transition-colors"
                >
                  Add Another Course
                </button>
              </div>
            ) : (
              <form className="space-y-6">
                {formData.map((course, index) => (
                  <div
                    key={index}
                    className="space-y-6 bg-white rounded-lg"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Academic Year */}
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <FaCalendarAlt className="mr-2 text-blue-500" />
                          Academic Year
                        </label>
                        <select
                          name="academic_year"
                          value={course.academic_year}
                          onChange={(e) => handleChange(index, e)}
                          className="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        >
                          <option value="">Select Year</option>
                          {yearList.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Branch */}
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <FaCodeBranch className="mr-2 text-blue-500" />
                          Branch
                        </label>
                        <div className="relative">
                          <input
                            name="branch"
                            type="text"
                            value={
                              branchdata.find(
                                (branch) => branch.idbranch === selectedBranch
                              )?.branchname || "Branch not found"
                            }
                            className="block w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 cursor-not-allowed shadow-sm"
                            disabled
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Course Code */}
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <FaBook className="mr-2 text-blue-500" />
                          Course Code
                        </label>
                        <input
                          type="text"
                          name="course_code"
                          value={course.course_code}
                          onChange={(e) => handleChange(index, e)}
                          placeholder="e.g. CS101"
                          className="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        />
                      </div>

                      {/* Semester */}
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <FaGraduationCap className="mr-2 text-blue-500" />
                          Semester
                        </label>
                        <select
                          name="sem"
                          value={course.sem}
                          onChange={(e) => handleChange(index, e)}
                          className="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        >
                          <option value="">Select Semester</option>
                          {Array.from({ length: 8 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                              Semester {i + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Teacher Selection */}
                    <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-medium text-gray-800 flex items-center">
                        <FaUserPlus className="mr-2 text-blue-500" />
                        Teacher Assignment
                      </h3>
                      
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <FaSearch className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search teachers..."
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto p-2 bg-white rounded-lg border border-gray-200">
                        {getFilteredUsers().length > 0 ? (
                          getFilteredUsers().map((user) => (
                            <div 
                              key={user.userid} 
                              className={`flex justify-between items-center p-3 rounded-lg border ${
                                course.user_ids.some(t => t.id === user.userid) 
                                  ? 'bg-blue-50 border-blue-300' 
                                  : 'bg-white border-gray-200 hover:bg-gray-50'
                              } transition-colors`}
                            >
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                                  {user.teacher_name.charAt(0)}
                                </div>
                                <span className="font-medium">{user.teacher_name}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  if (course.user_ids.some(t => t.id === user.userid)) {
                                    removeTeacher(index, user.userid);
                                  } else {
                                    addTeacher(index, user.userid, user.teacher_name);
                                  }
                                }}
                                className={`p-2 rounded-md ${
                                  course.user_ids.some(t => t.id === user.userid)
                                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                }`}
                              >
                                {course.user_ids.some(t => t.id === user.userid) ? (
                                  <><FaUserMinus className="mr-1" /> Remove</>
                                ) : (
                                  <><FaUserPlus className="mr-1" /> Add</>
                                )}
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-2 text-center py-4 text-gray-500">
                            No teachers found matching your search criteria
                          </div>
                        )}
                      </div>
                      
                      {/* Selected Teachers */}
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Teachers ({course.user_ids.length})</h4>
                        {course.user_ids.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {course.user_ids.map((teacher) => (
                              <div
                                key={teacher.id}
                                className="flex items-center bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm"
                              >
                                <span className="mr-2">{teacher.name}</span>
                                <button
                                  type="button"
                                  onClick={() => removeTeacher(index, teacher.id)}
                                  className="text-blue-500 hover:text-blue-700 focus:outline-none"
                                >
                                  <FaUserMinus />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No teachers selected yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end pt-6">
                  <button
                    type="button"
                    onClick={handleProceedClick}
                    className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg px-8 py-3 hover:from-blue-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg disabled:opacity-70"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      "Assign Course"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}