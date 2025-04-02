import { useEffect, useState } from "react";
import { api2 } from "../../../api";
import { FaTrash, FaClock, FaSearch, FaExclamationCircle, FaSpinner, FaCalendarAlt } from "react-icons/fa";
import Pagination from "../../../components/Pagination/Pagination";

export default function MeetingTimeList() {
  const [meetings, setMeetings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteInProgress, setDeleteInProgress] = useState(null);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchMeetings = async () => {
      setIsLoading(true);
      try {
        const response = await api2.get("/api/meeting-times/");
        setMeetings(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching meeting times:", error);
        setError("Failed to load meeting times. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMeetings();
  }, []);

  const handleDelete = async (pid) => {
    setDeleteInProgress(pid);
    try {
      await api2.delete(`/api/meeting-times/delete/${pid}/`);
      setMeetings((prevMeetings) => prevMeetings.filter((mt) => mt.pid !== pid));
    } catch (error) {
      console.error("Error deleting meeting time:", error);
      alert("Failed to delete meeting time. Please try again.");
    } finally {
      setDeleteInProgress(null);
    }
  };

  const filteredMeetings = meetings.filter(
    (meeting) =>
      meeting.day.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.time.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.pid.toString().includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredMeetings.length / itemsPerPage);
  const paginatedMeetings = filteredMeetings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-lg p-6">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <FaClock className="mr-3" /> Meeting Times List
        </h1>
        <p className="text-blue-100 mt-2">
          View and manage all available meeting time slots
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
            placeholder="Search by day, time or ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <FaSpinner className="animate-spin text-blue-600 text-2xl" />
            <span className="ml-2 text-gray-600">Loading meeting times...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center">
            <FaExclamationCircle className="mr-2" />
            {error}
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            {searchTerm ? "No meeting times match your search" : "No meeting times available"}
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
                    Day
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedMeetings.map((meeting) => (
                  <tr key={meeting.pid} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {meeting.pid}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaCalendarAlt className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-700">{meeting.day}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaClock className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-700">{meeting.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleDelete(meeting.pid)}
                        disabled={deleteInProgress === meeting.pid}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
                      >
                        {deleteInProgress === meeting.pid ? (
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

        {!isLoading && !error && filteredMeetings.length > 0 && (
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