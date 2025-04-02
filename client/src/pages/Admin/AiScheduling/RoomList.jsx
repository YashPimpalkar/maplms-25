import { useEffect, useState } from "react";
import { api2 } from "../../../api";
import { FaTrash, FaDoorOpen, FaSearch, FaExclamationCircle, FaSpinner, FaChair } from "react-icons/fa";
import Pagination from "../../../components/Pagination/Pagination";

export default function RoomList() {
    const [rooms, setRooms] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteInProgress, setDeleteInProgress] = useState(null);
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchRooms = async () => {
            setIsLoading(true);
            try {
                const response = await api2.get("/api/rooms/");
                setRooms(response.data);
                setError(null);
            } catch (error) {
                console.error("Error fetching rooms:", error);
                setError("Failed to load rooms. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchRooms();
    }, []);

    const handleDelete = async (id) => {
        setDeleteInProgress(id);
        try {
            await api2.delete(`/api/rooms/delete/${id}/`);
            setRooms((prevRooms) => prevRooms.filter((room) => room.id !== id));
        } catch (error) {
            console.error("Error deleting room:", error);
            alert("Failed to delete room. Please try again.");
        } finally {
            setDeleteInProgress(null);
        }
    };

    const filteredRooms = rooms.filter(
        (room) =>
            room.r_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            room.seating_capacity.toString().includes(searchTerm)
    );

    const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
    const paginatedRooms = filteredRooms.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="max-w-4xl mx-auto mt-10">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-lg p-6">
                <h1 className="text-2xl font-bold text-white flex items-center">
                    <FaDoorOpen className="mr-3" /> Room List
                </h1>
                <p className="text-blue-100 mt-2">
                    View and manage all available classrooms
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
                        placeholder="Search by room number or capacity..."
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
                        <span className="ml-2 text-gray-600">Loading rooms...</span>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center">
                        <FaExclamationCircle className="mr-2" />
                        {error}
                    </div>
                ) : filteredRooms.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        {searchTerm ? "No rooms match your search" : "No rooms available"}
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
                                        Room Number
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Seating Capacity
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedRooms.map((room) => (
                                    <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {room.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                                    <FaDoorOpen className="text-indigo-600" />
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">{room.r_number}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <FaChair className="text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-700">{room.seating_capacity} seats</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <button
                                                onClick={() => handleDelete(room.id)}
                                                disabled={deleteInProgress === room.id}
                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
                                            >
                                                {deleteInProgress === room.id ? (
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

                {!isLoading && !error && filteredRooms.length > 0 && (
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