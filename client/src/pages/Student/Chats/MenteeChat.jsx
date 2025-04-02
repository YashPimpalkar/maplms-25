import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import api from "../../../api";
import { FaSearch, FaArrowLeft, FaPaperPlane, FaUsers, FaCircle, FaCalendarAlt, FaBook, FaGraduationCap } from "react-icons/fa";

const MenteeChat = ({ sid }) => {
  const { mmr_id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState([]);
  const [showChat, setShowChat] = useState(!!mmr_id);
  const [currentGroup, setCurrentGroup] = useState(null);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  useEffect(() => {
    if (sid) {
      const fetchGroups = async () => {
        try {
          const res = await api.get(`/api/forum/mentee/groups/${sid}`);
          setGroups(res.data);
          
          // If we have an mmr_id, find the current group
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
  }, [sid, mmr_id]);

  useEffect(() => {
    if (!mmr_id) return;
    let isMounted = true;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/api/forum/mentee/getmessages/${mmr_id}`);
        if (isMounted) setMessages(res.data);
      } catch (err) {
        console.error("Error fetching messages:", err);
        if (isMounted) setMessages([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [mmr_id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await api.post("/api/forum/mentee/sendmessages", {
        sid,
        mmr_id,
        msg: newMessage,
      });
      setNewMessage("");
      messageInputRef.current?.focus();
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleGroupClick = (group) => {
    setCurrentGroup(group);
    navigate(`/student/forums/${group.mmr_id}`);
    setShowChat(true);
  };

  const handleBackToGroups = () => {
    setShowChat(false);
    navigate('/student/forums');
  };

  const filteredGroups = groups.filter(group => 
    group.grp_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-[92vh] bg-gray-100 mt-8">
      {/* Sidebar - Always visible on desktop, toggleable on mobile */}
      <div className={`${showChat ? 'hidden md:block' : 'block'} w-full md:w-80 bg-white border-r border-gray-200 flex flex-col`}>
        <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <h2 className="text-xl font-bold flex items-center">
            <FaUsers className="mr-2" /> Forum Groups
          </h2>
          <div className="mt-4 relative">
            <input
              type="text"
              placeholder="Search groups..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2 pl-8 pr-4 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <FaSearch className="absolute left-2.5 top-3 text-white/70" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {filteredGroups.length > 0 ? (
            <div className="space-y-2">
              {filteredGroups.map((group) => (
                <div
                  key={group.mmr_id}
                  onClick={() => handleGroupClick(group)}
                  className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-100 ${
                    group.mmr_id.toString() === mmr_id?.toString() 
                      ? "bg-blue-50 border-l-4 border-blue-500" 
                      : ""
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                      {group.grp_name?.charAt(0) || "G"}
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="font-medium text-gray-800">{group.grp_name}</h3>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <FaCalendarAlt className="mr-1" /> 
                        <span className="mr-2">Sem {group.semester}</span>
                        <FaBook className="mr-1" /> 
                        <span>{group.year}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <FaUsers className="text-4xl mb-2 text-gray-400" />
              <p>{search ? "No matching groups found" : "No groups available"}</p>
              {search && (
                <button 
                  onClick={() => setSearch("")}
                  className="mt-2 text-sm text-blue-500 hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat Section */}
      <div className={`${!showChat ? 'hidden md:flex' : 'flex'} flex-col flex-1 bg-gray-100`}>
        {!mmr_id || !currentGroup ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <FaUsers className="text-blue-600 text-4xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Forums</h2>
            <p className="text-gray-600 max-w-md">
              Select a group from the sidebar to start chatting with your mentors and peers.
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-3 flex items-center shadow-sm">
              <button 
                onClick={handleBackToGroups}
                className="md:hidden mr-2 p-2 rounded-full hover:bg-gray-100 text-gray-600"
              >
                <FaArrowLeft />
              </button>
              
              <div className="flex items-center flex-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                  {currentGroup?.grp_name?.charAt(0) || "G"}
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-gray-800">{currentGroup?.grp_name}</h3>
                  <div className="flex items-center text-xs text-gray-500">
                    <FaCircle className="text-green-500 mr-1 text-xs" />
                    <span>Active now</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FaUsers className="text-gray-400 text-xl" />
                  </div>
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.reduce((acc, msg, index) => {
                    const msgDate = new Date(msg.created_at);
                    const formattedDate = msgDate.toDateString();

                    // Get the previous message's date for comparison
                    const prevMsgDate =
                      index > 0
                        ? new Date(messages[index - 1].created_at).toDateString()
                        : null;

                    // Determine the date label
                    let dateLabel = "";
                    const today = new Date();
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);

                    if (formattedDate === today.toDateString()) {
                      dateLabel = "Today";
                    } else if (formattedDate === yesterday.toDateString()) {
                      dateLabel = "Yesterday";
                    } else {
                      dateLabel = msgDate.toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      });
                    }

                    // Add date separator if needed
                    if (index === 0 || formattedDate !== prevMsgDate) {
                      acc.push(
                        <div key={`date-${index}`} className="flex justify-center my-4">
                          <span className="px-4 py-1 bg-gray-200 rounded-full text-xs font-medium text-gray-600">
                            {dateLabel}
                          </span>
                        </div>
                      );
                    }

                    const isSender = msg.sid && msg.sid.toString() === sid.toString();
                    
                    // Check if consecutive messages from same sender
                    const isConsecutive = index > 0 && 
                      messages[index - 1].sid === msg.sid &&
                      new Date(msg.created_at) - new Date(messages[index - 1].created_at) < 60000; // 1 minute
                    
                    acc.push(
                      <div
                        key={`msg-${index}`}
                        className={`flex ${isSender ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[75%] ${isConsecutive ? 'mt-1' : 'mt-2'}`}>
                          {!isConsecutive && !isSender && (
                            <div className="text-xs text-gray-500 ml-2 mb-1">{msg.sender_name || "Unknown"}</div>
                          )}
                          <div 
                            className={`px-4 py-2 rounded-lg ${
                              isSender 
                                ? "bg-blue-500 text-white rounded-br-none" 
                                : "bg-white border border-gray-200 rounded-bl-none"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.msg}</p>
                            <div className={`text-xs mt-1 text-right ${isSender ? "text-blue-100" : "text-gray-400"}`}>
                              {msgDate.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );

                    return acc;
                  }, [])}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-3">
              <div className="flex items-center bg-gray-100 rounded-full px-4">
                <input
                  ref={messageInputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent py-3 outline-none"
                />
                <button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className={`ml-2 p-2 rounded-full ${
                    newMessage.trim() 
                      ? "bg-blue-500 text-white hover:bg-blue-600" 
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  } transition-colors`}
                >
                  <FaPaperPlane />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MenteeChat;