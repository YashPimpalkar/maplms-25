import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../../../api";
import { FaBell, FaCalendarAlt, FaPaperPlane, FaClock, FaSpinner } from "react-icons/fa";

const Notification = ({uid}) => {
  const { mmr_id } = useParams(); // Extract mmrid from the URL
  const [message, setMessage] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("view"); // "view" or "create"
  
  useEffect(() => {
    const fetchNotifications = async () => {
      const notificationData = { uid, mmr_id };
      console.log("Notification Data:", notificationData);
      try {
        const response = await api.post("/api/notifications/get", { notificationData });
        setNotifications(response.data); // Update state with fetched notifications
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [uid, mmr_id]); // Runs when mentor_id or mmr_id changes

  console.log("Notifications:", notifications);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const notificationData = {
      mmr_id,
      message,
      eventDate,
      uid
    };

    console.log("Submitting notification:", notificationData);

    // Send data to backend (Replace with actual API call)
    try {
      const response = await api.post("/api/notifications/", {notificationData});
      
      console.log("Notification created successfully:", response);
      
      // Add the new notification to the list
      const newNotification = {
        nid: response.data.nid || Date.now(),
        message,
        event_date: eventDate,
        created_at: new Date().toISOString()
      };
      
      setNotifications([newNotification, ...notifications]);
      setMessage("");
      setEventDate("");
      setActiveTab("view");
      
      // Show success message
      const successElement = document.getElementById("success-message");
      successElement.classList.remove("opacity-0");
      setTimeout(() => {
        successElement.classList.add("opacity-0");
      }, 3000);
      
    } catch (error) {
      console.error("Error submitting notification:", error);
      setError("Failed to create notification. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Get time elapsed since notification
  const getTimeElapsed = (dateString) => {
    const notificationDate = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-5">
      {/* Success Message */}
      <div 
        id="success-message" 
        className="fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md transition-opacity duration-500 opacity-0 z-50"
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm">Notification created successfully!</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex items-center">
            <FaBell className="text-3xl mr-4" />
            <div>
              <h1 className="text-2xl font-bold">Mentor Notifications</h1>
              <p className="text-blue-100">Manage and send notifications to your mentees</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button 
            className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'view' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('view')}
          >
            View Notifications
          </button>
          <button 
            className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'create' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('create')}
          >
            Create Notification
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'view' ? (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">All Notifications</h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                  {notifications.length} Total
                </span>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <FaSpinner className="animate-spin text-blue-600 text-3xl" />
                </div>
              ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <FaBell className="mx-auto text-gray-300 text-5xl mb-4" />
                  <p className="text-gray-500 text-lg">No notifications found.</p>
                  <button 
                    onClick={() => setActiveTab('create')} 
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Your First Notification
                  </button>
                </div>
              ) : (
                <ul className="space-y-4">
                  {notifications.map((notification) => (
                    <li 
                      key={notification.nid} 
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="flex items-start">
                        <div className="bg-blue-100 p-3 rounded-full mr-4">
                          <FaBell className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800 font-medium mb-2">{notification.message}</p>
                          <div className="flex flex-wrap items-center text-sm text-gray-500 gap-4">
                            <div className="flex items-center">
                              <FaCalendarAlt className="mr-1 text-blue-500" />
                              <span>{formatDate(notification.event_date)}</span>
                            </div>
                            <div className="flex items-center">
                              <FaClock className="mr-1 text-blue-500" />
                              <span>{getTimeElapsed(notification.created_at || notification.event_date)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Create New Notification</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="message">
                    Message
                  </label>
                  <textarea
                    id="message"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows="4"
                    placeholder="Enter your notification message here..."
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="eventDate">
                    Event Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FaCalendarAlt className="text-gray-500" />
                    </div>
                    <input
                      id="eventDate"
                      type="datetime-local"
                      className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveTab('view')}
                    className="mr-4 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="mr-2" />
                        Send Notification
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notification;