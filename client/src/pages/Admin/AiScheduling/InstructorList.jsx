import { useEffect, useState } from "react";
import { api2 } from "../../../api";
import { FaTrash, FaUserTie, FaSearch, FaExclamationCircle, FaSpinner, FaIdCard } from "react-icons/fa";
import Pagination from "../../../components/Pagination/Pagination";

export default function InstructorList() {
    const [instructors, setInstructors] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteInProgress, setDeleteInProgress] = useState(null);
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchInstructors = async () => {
            setIsLoading(true);
            try {
                const response = await api2.get("/api/instructors/");
                setInstructors(response.data);
                setError(null);
            } catch (error) {
                console.error("Error fetching instructors:", error);
                setError("Failed to load instructors. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchInstructors();
    }, []);

    const handleDelete = async (id) => {
        setDeleteInProgress(id);
        try {
            await api2.delete(`/api/instructors/delete/${id}/`);
            setInstructors((prevInstructors) => prevInstructors.filter((inst) => inst.id !== id));
        } catch (error) {
            console.error("Error deleting instructor:", error);
            alert("Failed to delete instructor. Please try again.");
        } finally {
            setDeleteInProgress(null);
        }
    };

    const filteredInstructors = instructors.filter(
        (instructor) =>
            instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            instructor.uid.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredInstructors.length / itemsPerPage);
    const paginatedInstructors = filteredInstructors.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="max-w-4xl mx-auto mt-10">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-lg p-6">
                <h1 className="text-2xl font-bold text-white flex items-center">
                    <FaUserTie className="mr-3" /> Instructor List
                </h1>
                <p className="text-blue-100 mt-2">
                    View and manage all faculty members
                </p>
            </div>

            <div className="bg-white shadow-lg rounded-b-lg p-6">
                {/* Search Bar */}
                <div className="mb-6 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name or UID..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1); // Reset to first page on search
                        }}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                        <FaSpinner className="animate-spin text-indigo-600 text-2xl" />
                        <span className="ml-2 text-gray-600">Loading instructors...</span>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center">
                        <FaExclamationCircle className="mr-2" />
                        {error}
                    </div>
                ) : filteredInstructors.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        {searchTerm ? "No instructors match your search" : "No instructors available"}
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        UID
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedInstructors.map((instructor) => (
                                    <tr key={instructor.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {instructor.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                                    <FaUserTie className="text-indigo-600" />
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">{instructor.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <FaIdCard className="text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-700">{instructor.uid}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <button
                                                onClick={() => handleDelete(instructor.id)}
                                                disabled={deleteInProgress === instructor.id}
                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
                                            >
                                                {deleteInProgress === instructor.id ? (
                                                    <FaSpinner className="animate-spin mr-1" />
                                                ) : (
                                                    <FaTrash className="mr-1" />
                                                )}
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!isLoading && !error && filteredInstructors.length > 0 && (
                    <div className="mt-6">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}