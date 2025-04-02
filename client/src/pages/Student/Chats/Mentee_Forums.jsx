import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api.js";
import { FaUsers, FaSearch, FaComments, FaCalendarAlt, FaBook, FaGraduationCap, FaCircle } from "react-icons/fa";

const Mentee_Forums = ({ sid }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        console.log("Fetching groups for mentee sid:", sid);
        const res = await api.get(`/api/forum/mentee/groups/${sid}`);

        console.log("Fetched groups response:", res.data);
        if (Array.isArray(res.data)) {
          setGroups(res.data);
        } else {
          console.error("Unexpected API response format:", res.data);
          setGroups([]);
        }
      } catch (err) {
        console.error("Error fetching mentee groups:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (sid) {
      fetchGroups();
    }
  }, [sid]);

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    navigate(`/student/forums/${group.mmr_id}`);
  };

  const filteredGroups = groups.filter(group => 
    group.grp_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 mt-5">
      {/* Sidebar for Groups */}
      <div className="w-full h-full md:w-1/4 bg-gradient-to-br from-blue-600 to-indigo-800 p-4 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white flex items-center justify-center rounded-full shadow-lg">
              <FaComments className="text-blue-600 text-xl" />
            </div>
            <h2 className="text-xl font-bold ml-3 text-white">Forums</h2>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-indigo-700/50 text-white placeholder-gray-300 border border-indigo-600 focus:outline-none focus:ring-2 focus:ring-white"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
          <FaUsers className="mr-2" /> My Groups
        </h3>
        
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/20 border border-red-400 text-white p-3 rounded-lg">
            <p>Error: {error}</p>
          </div>
        ) : filteredGroups.length > 0 ? (
          <div className="space-y-2">
            {filteredGroups.map((group) => (
              <div
                key={group.mmr_id}
                onClick={() => handleSelectGroup(group)}
                className={`cursor-pointer p-3 rounded-lg transition-all hover:bg-white/10 ${
                  selectedGroup?.mmr_id === group.mmr_id
                    ? "bg-white/20 border-l-4 border-yellow-400"
                    : ""
                }`}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                    {group.grp_name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-white">{group.grp_name}</h4>
                    <div className="flex items-center text-xs text-gray-300 mt-1">
                      <FaCalendarAlt className="mr-1" /> 
                      <span className="mr-2">Sem {group.semester}</span>
                      <FaBook className="mr-1" /> 
                      <span className="mr-2">{group.year}</span>
                      <FaGraduationCap className="mr-1" /> 
                      <span>{group.academic_year}</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-300">
                    {new Date().toLocaleDateString()}
                  </span>
                  {/* <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-xs text-white">
                    {Math.floor(Math.random() * 5)}
                  </span> */}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-indigo-700/30 rounded-lg p-4 text-center">
            <p className="text-gray-300">No groups found</p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="mt-2 text-sm text-blue-300 hover:text-blue-200"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Chat Section */}
      <div className="w-full md:w-3/4 flex flex-col bg-gray-100 hidden md:block">
        {selectedGroup ? (
          <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="bg-white shadow-sm p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                  {selectedGroup.grp_name.charAt(0)}
                </div>
                <div className="ml-3">
                  <h3 className="font-medium">{selectedGroup.grp_name}</h3>
                  <div className="flex items-center text-xs text-gray-500">
                    <FaCircle className="text-green-500 mr-1 text-xs" />
                    <span>Active now</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <FaSearch className="text-gray-500" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <FaUsers className="text-gray-500" />
                </button>
              </div>
            </div>
            
            {/* Chat Messages Area - This would be replaced with actual chat functionality */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              <div className="flex justify-center items-center h-full">
                <p className="text-gray-500">Loading messages...</p>
              </div>
            </div>
            
            {/* Message Input */}
            <div className="bg-white p-4 border-t">
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="ml-2 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <FaComments className="text-blue-600 text-4xl" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Welcome to Forums
            </h2>
            <p className="text-lg text-gray-600 max-w-md mb-8">
              Connect with your mentors and peers in real-time discussions
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <FaUsers className="text-blue-600 text-xl" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Join Discussions</h3>
                <p className="text-gray-600">
                  Select a group from the sidebar to participate in discussions with your mentors and peers
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <FaBook className="text-green-600 text-xl" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Learn Together</h3>
                <p className="text-gray-600">
                  Share resources, ask questions, and collaborate on projects with your group members
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mentee_Forums;