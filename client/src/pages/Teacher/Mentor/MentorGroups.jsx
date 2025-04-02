import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Pagination from "../../../components/Pagination/Pagination";
import api from "../../../api.js";
import { FaUsers, FaSearch, FaEye, FaSpinner, FaUserFriends } from "react-icons/fa";

const MentorGroups = ({ uid }) => {
  const [mentorGroups, setMentorGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const groupsPerPage = 10; // Number of groups per page

  const navigate = useNavigate();
  const mentorId = uid; // Dynamic mentor ID (should come from auth/context)

  // Fetch mentor groups
  useEffect(() => {
    const fetchMentorGroups = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/mentor/get-mentor-groups/${mentorId}`);
        setMentorGroups(response.data);
        setFilteredGroups(response.data);
      } catch (error) {
        console.error("Error fetching mentor groups:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMentorGroups();
  }, [mentorId]);

  // Handle search filter (Group Name, Semester, Academic Year)
  useEffect(() => {
    const filtered = mentorGroups.filter((group) =>
      group.grp_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.semester.toString().includes(searchTerm) ||
      group.academic_year.toString().includes(searchTerm)
    );

    setFilteredGroups(filtered);
    setCurrentPage(1); // Reset to first page when searching
  }, [searchTerm, mentorGroups]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Get current page data
  const indexOfLastGroup = currentPage * groupsPerPage;
  const indexOfFirstGroup = indexOfLastGroup - groupsPerPage;
  const currentGroups = filteredGroups.slice(indexOfFirstGroup, indexOfLastGroup);

  const handleGroupClick = (group) => {
    navigate(`/mentor-group-details/${group.mmr_id}`, {
      state: { mentorGroup: group }, // Optionally pass additional data in state
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto mt-5">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <FaUserFriends className="text-blue-600 text-5xl mr-3" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl text-blue-700 font-bold">
              Mentor Groups
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            View and manage your assigned student mentoring groups
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by Group Name, Semester, or Academic Year..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Groups Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <FaSpinner className="animate-spin text-blue-600 text-3xl" />
            </div>
          ) : currentGroups.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Group Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Semester
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Year
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Academic Year
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentGroups.map((group) => (
                    <tr
                      key={group.mmr_id}
                      className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{group.grp_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Semester {group.semester}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {group.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {group.academic_year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                        <button
                          onClick={() => handleGroupClick(group)}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                          <FaEye className="mr-2" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center py-20 text-gray-500">
              <FaUsers className="text-gray-300 text-5xl mb-4" />
              <p className="text-xl font-medium">No mentor groups found</p>
              <p className="mt-2">Try adjusting your search criteria</p>
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredGroups.length > groupsPerPage && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredGroups.length / groupsPerPage)}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorGroups;