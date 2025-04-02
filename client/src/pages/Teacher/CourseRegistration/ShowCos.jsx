import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from "../../../api";
import { FaSpinner, FaExclamationTriangle, FaClipboard } from 'react-icons/fa';

export default function ShowCos() {
    const location = useLocation();
    const { usercourse_id } = location.state;
    const [loading, setLoading] = useState(false);
    const [cosData, setCosData] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [courseInfo, setCourseInfo] = useState(null);

    useEffect(() => {
        const fetchCosData = async () => {
            try {
                setLoading(true);
                const response = await api.post(`/api/cos/${usercourse_id}`);
                console.log(response.data);
                setCosData(response.data);
                
                // Fetch course info
                try {
                    const courseResponse = await api.get(`/api/usercourse/details/${usercourse_id}`);
                    setCourseInfo(courseResponse.data[0]);
                } catch (error) {
                    console.error("Error fetching course info:", error);
                }
            } catch (error) {
                if (error.response && error.response.data) {
                    setErrorMessage(error.response.data.error || "An error occurred.");
                } else {
                    setErrorMessage("There was an error fetching the COS records. Please try again.");
                }
            } finally {
                setLoading(false);
            }
        };

        if (usercourse_id) {
            fetchCosData();
        }
    }, [usercourse_id]);

    return (
        <div className="left-0 z-45 w-full mt-8">
            <div className="max-w-screen-lg mx-auto p-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-xl">
                <h1 className="text-3xl font-bold mb-6 text-blue-800 text-center border-b-4 border-blue-500 pb-2 inline-block mx-auto">
                    Course Outcomes
                </h1>

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

                {errorMessage && (
                    <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center">
                        <FaExclamationTriangle className="mr-2 text-red-500" />
                        <p>{errorMessage}</p>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <FaSpinner className="animate-spin text-blue-500 text-4xl" />
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {cosData.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                CO Identifier
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                CO Description
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                Created Time
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {cosData.map((cos, index) => (
                                            <tr key={index} className="hover:bg-blue-50 transition-colors duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        {cos.co_name}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700">
                                                    {cos.co_body}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(cos.created_time).toLocaleString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                <FaClipboard className="text-gray-400 text-5xl mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Course Outcomes Found</h3>
                                <p className="text-gray-500">
                                    There are no course outcomes available for this course.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}