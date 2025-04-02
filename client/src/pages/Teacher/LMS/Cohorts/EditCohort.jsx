import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../../../api';
import { FaUsers, FaEdit, FaArrowLeft, FaSpinner } from 'react-icons/fa';

const EditCohort = () => {
  const { cohortId } = useParams(); // Get cohort ID from URL
  const navigate = useNavigate();
  
  const [cohortName, setCohortName] = useState('');
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState('');
  const [classname, setClassname] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [branches, setBranches] = useState([]); // For branch dropdown
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Branch mapping object
  const branchMapping = {
    1: 'COMPUTER',
    2: 'IT',
    3: 'AIDS',
    4: 'AIML',
    5: 'MECATRONICS',
  };

  // Get academic years for dropdown
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

  // Fetch cohort details by ID
  const fetchCohortDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/cohorts/${cohortId}`);
      const cohort = response.data;
      setCohortName(cohort.cohort_name);
      setBranch(cohort.branch);  // This is the branch ID
      setSemester(cohort.semester);
      setClassname(cohort.classname);
      setAcademicYear(cohort.academic_year);
    } catch (error) {
      console.error('Error fetching cohort details:', error);
      setError('Failed to load cohort details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch branches for dropdown
  const fetchBranches = async () => {
    try {
      const response = await axios.get('/api/branch/show');
      setBranches(response.data); // Assume this API returns a list of branches
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  useEffect(() => {
    fetchCohortDetails();
    fetchBranches();
  }, [cohortId]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      await api.put(`/api/cohorts/${cohortId}`, {
        cohort_name: cohortName,
        branch,
        semester,
        classname,
        academic_year: academicYear,
      });
      setSuccess('Cohort updated successfully!');
      setTimeout(() => {
        navigate('/lms/ManageCohorts'); // Redirect to Manage Cohorts page
      }, 1500);
    } catch (error) {
      console.error('Error updating cohort:', error);
      setError('Failed to update cohort. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/lms/ManageCohorts')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors duration-200"
        >
          <FaArrowLeft className="mr-2" /> Back to Manage Cohorts
        </button>
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <FaEdit className="text-blue-600 text-5xl mr-3" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl text-blue-700 font-bold">
              Edit Cohort
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Update the details for this student cohort
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
          {/* Status Messages */}
          {error && (
            <div className="bg-red-50 p-4 border-b border-red-100">
              <p className="text-red-700 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 p-4 border-b border-green-100">
              <p className="text-green-700 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {success}
              </p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <FaSpinner className="animate-spin text-blue-600 text-3xl" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cohort Name */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cohortName">
                    Cohort Name
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
                    Branch
                  </label>
                  <select
                    id="branch"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="" disabled>Select Branch</option>
                    {Object.keys(branchMapping).map((key) => (
                      <option key={key} value={key}>
                        {branchMapping[key]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Semester */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="semester">
                    Semester
                  </label>
                  <select
                    id="semester"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="" disabled>Select Semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <option key={num} value={num}>
                        Semester {num}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Class Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="classname">
                    Class Name
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
                    Academic Year
                  </label>
                  <select
                    id="academicYear"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="" disabled>Select Academic Year</option>
                    {getAcademicYears().map((year, index) => (
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
                  disabled={submitting}
                  className={`w-full flex items-center justify-center bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                    submitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    'Update Cohort'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditCohort;