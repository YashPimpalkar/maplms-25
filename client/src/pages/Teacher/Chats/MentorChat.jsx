import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import api from "../../../api";
import { FaArrowLeft, FaPaperPlane, FaSearch, FaUsers, FaEllipsisV, FaCalendarAlt, FaBook, FaGraduationCap, FaComments } from "react-icons/fa";

const MentorChat = ({ uid }) => {
  const { mmr_id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState([]);
  const [showChat, setShowChat] = useState(!!mmr_id);
  const [currentGroup, setCurrentGroup] = useState(null);
  const chatEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  // Handle window resize for responsive view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (uid) {
      const fetchGroups = async () => {
        try {
          const res = await api.get(`/api/forum/teacher/groups/${uid}`);
          setGroups(res.data);
          
          // Find current group details if mmr_id exists
          if (mmr_id) {
            const group = res.data.find(g => g.mmr_id.toString() === mmr_id.toString());
            if (group) setCurrentGroup(group);
          }
        } catch (err) {
          console.error("Error fetching groups:", err);
        }
      };
      fetchGroups();
    }
  }, [uid, mmr_id]);

  useEffect(() => {
    if (!mmr_id) return;
    let isMounted = true;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/api/forum/teacher/getmessages/${mmr_id}`);
        if (isMounted) setMessages(res.data);
      } catch (err) {
        console.error("Error fetching messages:", err);
        if (isMounted) setMessages([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMessages();
    
    // Set up polling for new messages
    const intervalId = setInterval(fetchMessages, 5000);
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [mmr_id]);

  useEffect(() => {
    // Scroll to bottom when messages change
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !mmr_id) return;

    try {
      await api.post("/api/forum/teacher/sendmessages", {
        mmr_id,
        t_id: uid,
        msg: newMessage,
      });
      
      // Optimistically add message to UI
      setMessages([
        ...messages,
        {
          msg: newMessage,
          sender_name: "You", // Will be replaced on next fetch
          created_at: new Date().toISOString(),
          t_id: uid,
          sid: null,
        },
      ]);
      
      setNewMessage("");
      messageInputRef.current?.focus();
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleGroupSelect = (group) => {
    setCurrentGroup(group);
    setShowChat(true);
    navigate(`/teacher/forums/${group.mmr_id}`);
  };

  const handleBackToGroups = () => {
    setShowChat(false);
    navigate("/teacher/forums");
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.grp_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-[94vh] md:flex-row  bg-gray-100 mt-5">
      {/* Sidebar for Groups - Hidden on mobile when chat is shown */}
      <div className={`${(isMobileView && showChat) ? 'hidden' : 'block'} w-full md:w-1/4 bg-gradient-to-b from-blue-600 to-blue-800 p-6 text-white overflow-y-auto`}>
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center mb-4">
          <FaUsers className="mr-2" />
          <h3 className="text-lg font-semibold">Mentor Groups</h3>
        </div>

        {filteredGroups.length > 0 ? (
          <ul className="space-y-3">
            {filteredGroups.map((group) => (
              <li
                key={group.mmr_id}
                onClick={() => handleGroupSelect(group)}
                className={`cursor-pointer p-4 rounded-lg transition-all hover:transform hover:scale-105 ${
                  currentGroup?.mmr_id === group.mmr_id
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

      {/* Chat Section - Hidden on mobile when group list is shown */}
      <div className={`${(isMobileView && !showChat) ? 'hidden' : 'block'} w-full md:w-3/4 flex flex-col bg-gray-100 h-full`}>
        {mmr_id && currentGroup ? (
          <>
            {/* Chat Header */}
            <div className="bg-white shadow-md p-4 flex items-center">
              {isMobileView && (
                <button
                  onClick={handleBackToGroups}
                  className="mr-3 text-blue-600 hover:text-blue-800"
                >
                  <FaArrowLeft size={20} />
                </button>
              )}
              <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                {currentGroup.grp_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-bold text-lg">{currentGroup.grp_name}</h2>
                <div className="flex text-xs text-gray-500">
                  <span className="flex items-center mr-2">
                    <FaCalendarAlt className="mr-1" /> {currentGroup.semester}
                  </span>
                  <span className="flex items-center mr-2">
                    <FaBook className="mr-1" /> {currentGroup.year}
                  </span>
                  <span className="flex items-center">
                    <FaGraduationCap className="mr-1" /> {currentGroup.academic_year}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : messages.length > 0 ? (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.t_id === uid ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg px-4 py-2 ${
                        msg.t_id === uid
                          ? "bg-blue-600 text-white rounded-tr-none"
                          : "bg-gray-200 text-gray-800 rounded-tl-none"
                      }`}
                    >
                      <div className="text-xs mb-1 font-semibold">
                        {msg.t_id === uid ? "You" : msg.sender_name}
                      </div>
                      <p className="break-words">{msg.msg}</p>
                      <div className="text-xs mt-1 text-right opacity-75">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 mt-10">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="bg-white p-3 border-t flex items-center"
            >
              <input
                type="text"
                ref={messageInputRef}
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button
                type="submit"
                className="ml-2 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!newMessage.trim()}
              >
                <FaPaperPlane />
              </button>
            </form>
          </>
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

export default MentorChat;