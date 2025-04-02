import React, { useEffect, useState } from 'react';
import api from '../../api';
import { useLocation } from 'react-router-dom';
import LoadingButton from "../../components/Loading/Loading";

const AdminSideShowCOs = () => {
    const location = useLocation();
    const { usercourse_id } = location.state;
    const [loading, setLoading] = useState(false);
    const [cosData, setCosData] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchCosData = async () => {
            try {
                setLoading(true);
                const response = await api.post(`/api/cos/${usercourse_id}`); // Assuming GET request
                console.log(response.data);
                setCosData(response.data);
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
        <div className="max-w-screen-lg mx-auto p-6 border border-gray-300 shadow-lg rounded-md bg-white mt-10">
            <h1 className="text-2xl md:text-3xl lg:text-4xl mb-6 text-blue-500 text-center">
                COS Records
            </h1>

            {errorMessage && (
                <div className="mb-4 text-red-500 text-center">
                    {errorMessage}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                COS Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                COS Body
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                Created Time
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {cosData.map((cos, index) => (
                            <tr key={index}>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {cos.co_name}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {cos.co_body}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(cos.created_time).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminSideShowCOs;