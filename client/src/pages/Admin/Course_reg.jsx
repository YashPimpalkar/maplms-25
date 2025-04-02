import React, { useState, useEffect } from "react";
import api from "../../api";
import { FaPlus, FaMinus, FaCheck, FaExclamationTriangle, FaSpinner, FaGraduationCap } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Course_reg() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [numCourses, setNumCourses] = useState(1); 
    const [formData, setFormData] = useState([{ course_code: "", course_name: "" }]);
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successStats, setSuccessStats] = useState({ count: 0 });

    useEffect(() => {
        // Reset form when successfully submitted
        if (isSubmitted) {
            const timer = setTimeout(() => {
                setShowSuccess(false);
                setFormData([{ course_code: "", course_name: "" }]);
                setNumCourses(1);
                setIsSubmitted(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isSubmitted]);

    const handleChange = (index, e) => {
        const { name, value } = e.target;
        const updatedFormData = [...formData];
        updatedFormData[index] = { ...updatedFormData[index], [name]: value };
        setFormData(updatedFormData);
        
        // Clear error for this field if it exists
        if (errors[index] && errors[index][name]) {
            const newErrors = [...errors];
            newErrors[index] = { ...newErrors[index], [name]: "" };
            setErrors(newErrors);
        }
    };

    const handleNumCoursesChange = (e) => {
        const value = parseInt(e.target.value);
        if (value < 1) return;
        
        setNumCourses(value);
        
        // Adjust form data array length
        if (value > formData.length) {
            // Add new empty courses
            const newCourses = Array(value - formData.length).fill().map(() => ({ course_code: "", course_name: "" }));
            setFormData([...formData, ...newCourses]);
        } else {
            // Remove excess courses
            setFormData(formData.slice(0, value));
        }
    };

    const incrementCourses = () => {
        const newValue = numCourses + 1;
        setNumCourses(newValue);
        setFormData([...formData, { course_code: "", course_name: "" }]);
    };

    const decrementCourses = () => {
        if (numCourses > 1) {
            const newValue = numCourses - 1;
            setNumCourses(newValue);
            setFormData(formData.slice(0, newValue));
        }
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = [];

        formData.forEach((course, index) => {
            newErrors[index] = {};
            
            if (!course.course_code.trim()) {
                newErrors[index].course_code = "Course code is required";
                isValid = false;
            } else if (!/^[A-Z0-9]+$/.test(course.course_code)) {
                newErrors[index].course_code = "Course code should contain only uppercase letters and numbers";
                isValid = false;
            }
            
            if (!course.course_name.trim()) {
                newErrors[index].course_name = "Course name is required";
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error("Please fix the errors in the form");
            return;
        }

        try {
            setLoading(true);
            const response = await api.post('/api/course/addcourses', formData);
            
            if (response.data.existingCourses && response.data.existingCourses.length > 0) {
                toast.warning(`The following courses are already registered: ${response.data.existingCourses.join(', ')}`);
            } else {
                setSuccessStats({ count: response.data.insertedRows || formData.length });
                setShowSuccess(true);
                setIsSubmitted(true);
                toast.success(`Successfully added ${response.data.insertedRows || formData.length} courses!`);
            }
        } catch (error) {
            console.error("Error adding courses:", error);
            const errorMessage = error.response?.data?.error || "Failed to add courses. Please try again.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <ToastContainer position="top-right" autoClose={5000} />
            
            <div className="max-w-3xl mx-auto">
                <div 
                    className="bg-white rounded-xl shadow-xl overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 sm:p-10 sm:pb-6">
                        <div className="flex items-center justify-center">
                            <FaGraduationCap className="text-white text-4xl mr-4" />
                            <h1 className="text-2xl font-extrabold text-white tracking-tight">
                                Course Registration
                            </h1>
                        </div>
                        <p className="mt-2 text-center text-blue-100">
                            Add new courses to the system database
                        </p>
                    </div>

                    <div className="px-6 py-8 sm:px-10">
                        <AnimatePresence>
                            {showSuccess && (
                                <div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4"
                                >
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <FaCheck className="h-5 w-5 text-green-500" />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-green-800">
                                                Success!
                                            </h3>
                                            <div className="mt-2 text-sm text-green-700">
                                                <p>
                                                    {successStats.count} course{successStats.count !== 1 ? 's' : ''} added successfully.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Number of courses to add
                                </label>
                                <div className="flex items-center">
                                    <button
                                        type="button"
                                        onClick={decrementCourses}
                                        className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <FaMinus className="h-4 w-4" />
                                    </button>
                                    <input
                                        type="number"
                                        value={numCourses}
                                        onChange={handleNumCoursesChange}
                                        min="1"
                                        className="mx-2 block w-20 text-center border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={incrementCourses}
                                        className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <FaPlus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {formData.map((course, index) => (
                                    <div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                Course #{index + 1}
                                            </h3>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                            <div>
                                                <label htmlFor={`course_code_${index}`} className="block text-sm font-medium text-gray-700">
                                                    Course Code*
                                                </label>
                                                <div className="mt-1 relative rounded-md shadow-sm">
                                                    <input
                                                        type="text"
                                                        id={`course_code_${index}`}
                                                        name="course_code"
                                                        value={course.course_code}
                                                        onChange={(e) => handleChange(index, e)}
                                                        className={`block w-full pr-10 focus:outline-none sm:text-sm rounded-md ${
                                                            errors[index]?.course_code 
                                                                ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                                                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                                        }`}
                                                        placeholder="e.g. CS101"
                                                    />
                                                    {errors[index]?.course_code && (
                                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                            <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                                                        </div>
                                                    )}
                                                </div>
                                                {errors[index]?.course_code && (
                                                    <p className="mt-2 text-sm text-red-600">
                                                        {errors[index].course_code}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor={`course_name_${index}`} className="block text-sm font-medium text-gray-700">
                                                    Course Name*
                                                </label>
                                                <div className="mt-1 relative rounded-md shadow-sm">
                                                    <input
                                                        type="text"
                                                        id={`course_name_${index}`}
                                                        name="course_name"
                                                        value={course.course_name}
                                                        onChange={(e) => handleChange(index, e)}
                                                        className={`block w-full pr-10 focus:outline-none sm:text-sm rounded-md ${
                                                            errors[index]?.course_name 
                                                                ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                                                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                                        }`}
                                                        placeholder="e.g. Introduction to Computer Science"
                                                    />
                                                    {errors[index]?.course_name && (
                                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                            <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                                                        </div>
                                                    )}
                                                </div>
                                                {errors[index]?.course_name && (
                                                    <p className="mt-2 text-sm text-red-600">
                                                        {errors[index].course_name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-5">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Register Courses"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}