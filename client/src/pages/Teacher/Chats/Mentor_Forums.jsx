import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api.js";
import { FaUsers, FaSearch, FaComments, FaCalendarAlt, FaBook, FaGraduationCap } from "react-icons/fa";

const Mentor_Forums = ({ uid }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get(`/api/forum/teacher/groups/${uid}`);
        setGroups(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (uid) {
      fetchGroups();
    }
  }, [uid]);

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    navigate(`/teacher/forums/${group.mmr_id}`);
  };

  const filteredGroups = groups.filter(group => 
    group.grp_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex  flex-col md:flex-row h-screen bg-gray-100 mt-5">
      {/* Sidebar for Groups */}
      <div className="w-full h-full md:w-1/4 bg-gradient-to-b from-blue-600 to-blue-800 p-6 text-white overflow-y-auto">
        {/* Forum Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="w-12 h-12 bg-white flex items-center justify-center rounded-full">
            <FaComments className="text-blue-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold ml-3">MAPLMS Forums</h2>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-blue-300" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 rounded-lg bg-blue-700 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-white"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center mb-4">
          <FaUsers className="mr-2" />
          <h3 className="text-lg font-semibold">Mentor Groups</h3>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500 bg-opacity-20 p-4 rounded-lg">
            <p className="text-red-100">Error: {error}</p>
          </div>
        ) : filteredGroups.length > 0 ? (
          <ul className="space-y-3">
            {filteredGroups.map((group) => (
              <li
                key={group.mmr_id}
                onClick={() => handleSelectGroup(group)}
                className={`cursor-pointer p-4 rounded-lg transition-all hover:transform hover:scale-105 ${
                  selectedGroup?.mmr_id === group.mmr_id
                    ? "bg-white text-blue-800 shadow-lg"
                    : "bg-blue-700 hover:bg-blue-600"
                }`}
              >
                <div className="flex items-center">
                  <div className="bg-blue-500 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                    {group.grp_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold">{group.grp_name}</h4>
                    <div className="flex flex-wrap text-xs mt-1 opacity-80">
                      <span className="flex items-center mr-2">
                        <FaCalendarAlt className="mr-1" /> {group.semester}
                      </span>
                      <span className="flex items-center mr-2">
                        <FaBook className="mr-1" /> {group.year}
                      </span>
                      <span className="flex items-center">
                        <FaGraduationCap className="mr-1" /> {group.academic_year}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="bg-blue-700 p-4 rounded-lg text-center">
            <p>No groups found matching your search</p>
          </div>
        )}
      </div>

      {/* Chat Section */}
      <div className="w-full md:w-3/4 flex flex-col bg-gray-100 hidden md:block">
        {selectedGroup ? (
          <h2 className="text-2xl font-bold text-blue-700">
            Chat for {selectedGroup.grp_name}
          </h2>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="max-w-2xl">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaComments className="text-blue-600 text-4xl" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Welcome to MAPLMS Forums
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Connect, discuss, and collaborate with your mentees in real-time
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <FaUsers className="text-blue-600 text-xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Group Discussions</h3>
                  <p className="text-gray-600">
                    Create and manage discussions with your mentee groups
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <FaCalendarAlt className="text-green-600 text-xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Semester Planning</h3>
                  <p className="text-gray-600">
                    Coordinate activities and deadlines for the semester
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Getting Started</h3>
                <ul className="text-gray-700 space-y-2">
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center bg-blue-100 rounded-full h-6 w-6 text-blue-800 mr-2 flex-shrink-0">1</span>
                    <span>Select a group from the sidebar to start chatting</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center bg-blue-100 rounded-full h-6 w-6 text-blue-800 mr-2 flex-shrink-0">2</span>
                    <span>Share important announcements and resources</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center bg-blue-100 rounded-full h-6 w-6 text-blue-800 mr-2 flex-shrink-0">3</span>
                    <span>Respond to student questions and provide guidance</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mentor_Forums;