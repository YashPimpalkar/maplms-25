import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../../../api";
import LoadingButton from "../../../components/Loading/Loading";
import { FaEdit, FaTrash, FaSave, FaPlus, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";

export default function Admin_Cos_Edit() {
    const location = useLocation();
    const { co_count, usercourse_id } = location.state;
    const [formData, setFormData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [newlyAddedCOs, setNewlyAddedCOs] = useState([]);
    const [deletedCOs, setDeletedCOs] = useState([]);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [courseInfo, setCourseInfo] = useState(null);

    useEffect(() => {
        const fetchCOData = async () => {
            if (usercourse_id) {
                setErr("");
                setLoading(true);
                try {
                    const res = await api.get(`/api/cos/admin/showcos/${usercourse_id}`);
                    const fetchedCOData = res.data;

                    // Set formData to fetched CO data with default structure
                    setFormData(
                        fetchedCOData.map(co => ({
                            cos_name: co.co_name,
                            cos_body: co.co_body,
                            idcos: co.idcos
                        }))
                    );
                    
                    // Fetch course info
                    const courseRes = await api.get(`/api/usercourse/details/${usercourse_id}`);
                    console.log(courseRes.data)
                    setCourseInfo(courseRes.data[0]);
                } catch (error) {
                    console.error("Error fetching COs data:", error);
                    setErr(error.response?.data?.error || "An unexpected error occurred");
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchCOData();
    }, [usercourse_id]);

    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (index, event) => {
        const { name, value } = event.target;
        const newFormData = [...formData];
        newFormData[index][name] = value;
        setFormData(newFormData);
    };

    const handleAddNewClick = () => {
        // Check if there's already an empty CO being added
        const hasEmptyCO = newlyAddedCOs.some(co => co.cos_name === "" && co.cos_body === "");
        
        if (!hasEmptyCO) {
            setIsAddingNew(true);
            setNewlyAddedCOs((prev) => [
                ...prev,
                { cos_name: "", cos_body: "", created_time: new Date().toISOString() }
            ]);
        }
    };
    
    const handleNewCoChange = (index, event) => {
        const { name, value } = event.target;
        const updatedCOs = [...newlyAddedCOs];
        updatedCOs[index][name] = name === "cos_id" ? Number(value) : value;
        setNewlyAddedCOs(updatedCOs);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            if (formData.length > 0) {
                // Handle updating existing COs
                const updatedCos = formData.map((cos) => ({
                    idcos: cos.idcos,
                    co_name: cos.cos_name,
                    co_body: cos.cos_body,
                }));

                const data = { usercourse_id, updatedCos };
                await api.put(`/api/cos/admin/update/${usercourse_id}`, data);
                setSuccessMessage("Course outcomes updated successfully.");
            }

          
            if (deletedCOs.length > 0) {
                const deleteCOs = deletedCOs.map((cos) => ({
                    co_name: cos.cos_name,
                    co_body: cos.cos_body,
                }));

                await api.delete(`/api/cos/admin/remove/${usercourse_id}`, {
                    data: { usercourse_id, deleteCOs }
                });
                setSuccessMessage("Course outcomes updated successfully.");
                setDeletedCOs([]);
            }
        } catch (error) {
            console.error("Error updating COS data:", error);
            setErrorMessage("Failed to update course outcomes. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveCO = (index) => {
        const deletedCO = formData[index];
        const newFormData = formData.filter((_, i) => i !== index);
        setFormData(newFormData);
        setDeletedCOs((prevDeletedCOs) => [...prevDeletedCOs, deletedCO]);
    };

    const handleEditCO = (index) => {
        alert(`Edit CO at index ${index}`);
    };

    return (
        <div className="left-0 z-45 w-full mt-8">
            <div className="max-w-screen-lg mx-auto p-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-xl">
                {courseInfo && (
                    <div className="mb-6 bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
                        <h2 className="text-xl font-semibold text-gray-800">{courseInfo.course_name}</h2>
                        <div className="mt-2 flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                Semester: {courseInfo.semester}
                            </span>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                Branch: {courseInfo.branch}
                            </span>
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                Academic Year: {courseInfo.academic_year}
                            </span>
                        </div>
                    </div>
                )}

                <h1 className="text-3xl font-bold mb-6 text-blue-800 text-center border-b-4 border-blue-500 pb-2 inline-block mx-auto">
                    Course Outcomes Management
                </h1>

                {errorMessage && (
                    <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center">
                        <FaExclamationTriangle className="mr-2 text-red-500" />
                        <p>{errorMessage}</p>
                    </div>
                )}
                
                {successMessage && (
                    <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md flex items-center">
                        <FaCheckCircle className="mr-2 text-green-500" />
                        <p>{successMessage}</p>
                    </div>
                )}

                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Course Outcomes</h2>
                        <button
                            type="button"
                            onClick={handleAddNewClick}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-200 flex items-center"
                        >
                            <FaPlus className="mr-2" /> Add New CO
                        </button>
                    </div>

                    {isAddingNew && newlyAddedCOs.length > 0 && (
                        <div className="mb-6 border-2 border-dashed border-blue-300 p-4 rounded-lg bg-blue-50">
                            <h3 className="text-lg font-medium text-blue-700 mb-3">New Course Outcome</h3>
                            {newlyAddedCOs.map((co, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            CO Identifier
                                        </label>
                                        <input
                                            type="text"
                                            name="cos_name"
                                            value={co.cos_name}
                                            onChange={(e) => handleNewCoChange(index, e)}
                                            placeholder="e.g., CO1"
                                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            style={{ textTransform: 'uppercase' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            CO Description
                                        </label>
                                        <input
                                            type="text"
                                            name="cos_body"
                                            value={co.cos_body}
                                            onChange={(e) => handleNewCoChange(index, e)}
                                            placeholder="Enter course outcome description"
                                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <LoadingButton />
                        </div>
                    ) : (
                        <>
                            {formData.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 border-collapse rounded-lg overflow-hidden">
                                        <thead>
                                            <tr className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                    CO Identifier
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                    CO Description
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-24">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {formData.map((cos, index) => (
                                                <tr key={index} className="hover:bg-blue-50 transition-colors duration-150">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <input
                                                            type="text"
                                                            name="cos_name"
                                                            value={cos.cos_name}
                                                            onChange={(e) => handleChange(index, e)}
                                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            style={{ textTransform: 'uppercase' }}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <textarea
                                                            name="cos_body"
                                                            value={cos.cos_body}
                                                            onChange={(e) => handleChange(index, e)}
                                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            rows="2"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveCO(index)}
                                                            className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 p-2 rounded-full transition-colors duration-200"
                                                            title="Remove CO"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-gray-500">No course outcomes found. Add a new CO to get started.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-lg font-medium disabled:opacity-70 w-full md:w-auto md:min-w-[200px]"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </>
                        ) : (
                            <>
                                <FaSave className="mr-2" /> Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}