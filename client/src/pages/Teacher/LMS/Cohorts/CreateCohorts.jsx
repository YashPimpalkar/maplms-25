import React, { useState, useEffect } from 'react';
import api from '../../../../api';
import { FaUsers, FaGraduationCap, FaCalendarAlt, FaSchool, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

const CreateCohorts = ({ uid }) => {
  const [cohortName, setCohortName] = useState('');
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState('');
  const [classname, setClassname] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [cohorts, setCohorts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBranches = async () => {
    try {
      const response = await api.get('api/branch/show');
      setBranches(response.data);
    } catch (error) {
      console.error('Error fetching branches:', error);
      setBranches([]);
      setErrorMessage('Error fetching branches. Please try again.');
    }
  };

  const getAcademicYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      const startYear = currentYear - i;
      const endYear = startYear + 1;
      years.push(`${startYear}-${endYear.toString().slice(-2)}`);
    }
    return years;
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const validateSemester = (value) => {
    const num = parseInt(value, 10); // Convert to number
    if (!isNaN(num) && num >= 1 && num <= 8) {
      setSemester(value); // Set only if valid
    } else {
      setSemester(''); // Clear input if invalid
      setErrorMessage('Semester must be a number between 1 and 8.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setCountdown(10);
    setIsSubmitting(true);

    try {
      await api.post('/api/cohorts/', {
        user_id: uid,
        cohort_name: cohortName,
        branch,
        semester: Number(semester), // Convert semester to number before submission
        classname,
        academic_year: academicYear,
      });
      setSuccessMessage('Cohort created successfully!');
      resetForm();
      startTimer();
    } catch (error) {
      console.error('Error creating cohort:', error);
      setErrorMessage('Error creating cohort. Please try again.');
      startTimer();
    } finally {
      setIsSubmitting(false);
    }
  };

  const startTimer = () => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          setSuccessMessage('');
          setErrorMessage('');
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetForm = () => {
    setCohortName('');
    setBranch('');
    setSemester('');
    setClassname('');
    setAcademicYear('');
  };

  const academicYears = getAcademicYears();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto mt-5">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <FaUsers className="text-blue-600 text-5xl mr-3" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl text-blue-700 font-bold">
              Create Cohort
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Create a new student cohort for your academic program
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
          {/* Notification Area */}
          {(successMessage || errorMessage) && (
            <div className={`p-4 ${successMessage ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center">
                {successMessage ? (
                  <FaCheck className="text-green-500 mr-2" />
                ) : (
                  <FaExclamationTriangle className="text-red-500 mr-2" />
                )}
                <p className={successMessage ? 'text-green-700' : 'text-red-700'}>
                  {successMessage || errorMessage}
                  {countdown > 0 && ` (${countdown})`}
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cohort Name */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cohortName">
                  <div className="flex items-center">
                    <FaUsers className="mr-2 text-blue-500" />
                    Cohort Name
                  </div>
                </label>
                <input
                  type="text"
                  id="cohortName"
                  value={cohortName}
                  onChange={(e) => setCohortName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter cohort name"
                  required
                />
              </div>

              {/* Branch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="branch">
                  <div className="flex items-center">
                    <FaSchool className="mr-2 text-blue-500" />
                    Branch
                  </div>
                </label>
                <select
                  id="branch"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="" disabled>Select branch</option>
                  {branches.length > 0
                    ? branches.map((b) => (
                        <option key={b.idbranch} value={b.idbranch}>
                          {b.branchname}
                        </option>
                      ))
                    : <option disabled>No branches available</option>}
                </select>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="semester">
                  <div className="flex items-center">
                    <FaGraduationCap className="mr-2 text-blue-500" />
                    Semester
                  </div>
                </label>
                <input
                  type="text"
                  id="semester"
                  value={semester}
                  onChange={(e) => validateSemester(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter a number between 1 and 8"
                  required
                />
              </div>

              {/* Class Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="classname">
                  <div className="flex items-center">
                    <FaUsers className="mr-2 text-blue-500" />
                    Class Name
                  </div>
                </label>
                <input
                  type="text"
                  id="classname"
                  value={classname}
                  onChange={(e) => setClassname(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter class name"
                  required
                />
              </div>

              {/* Academic Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="academicYear">
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2 text-blue-500" />
                    Academic Year
                  </div>
                </label>
                <select
                  id="academicYear"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="" disabled>Select academic year</option>
                  {academicYears.map((year, index) => (
                    <option key={index} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Cohort'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCohorts;