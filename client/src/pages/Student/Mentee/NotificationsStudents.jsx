import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "../../../api";
import Pagination from "../../../components/Pagination/Pagination";
import { FaBell, FaCalendarAlt, FaUser, FaClock, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const NotificationsStudents = ({ sid }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of notifications per page
  const navigate = useNavigate();

  useEffect(() => {
    if (!sid) return; // Prevent API call if sid is missing

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/mentee/notifications/${sid}`);
        setNotifications(response.data);
        console.log("Notifications:", response.data);
        // console.log("Notifications length:", response.data.length)
        setError(null);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setError("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [sid]);

  // Calculate total pages
  const totalPages = Math.ceil(notifications.length / itemsPerPage);

  // Get current page's data
  const paginatedNotifications = notifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
    <div className="min-h-screen bg-gray-50 py-8 mt-5">
      <div className="max-w-4xl mx-auto px-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 mb-6 hover:text-blue-800 transition-colors"
        >
          <FaArrowLeft className="mr-2" /> Back
        </button>
        
        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white/20 p-3 rounded-full mr-4">
                  <FaBell className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Your Notifications</h1>
                  <p className="text-blue-100">Stay updated with important announcements</p>
                </div>
              </div>
              <div className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
                {notifications.length} Notifications
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500">Loading your notifications...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r-md">
                <div className="flex items-center">
                  <div className="flex-shrink-0 text-red-500">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                    <p className="text-xs text-red-500 mt-1">Please try refreshing the page</p>
                  </div>
                </div>
              </div>
            ) : paginatedNotifications.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <div className="bg-blue-100 p-4 rounded-full inline-flex items-center justify-center mb-4">
                  <FaBell className="text-blue-600 text-3xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Notifications Yet</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  You don't have any notifications at the moment. Check back later for updates from your mentors.
                </p>
              </div>
            ) : (
              <ul className="space-y-4">
                {paginatedNotifications.map((notification) => (
                  <li 
                    key={notification.nid} 
                    className="p-5 border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-300 bg-white transform hover:scale-[1.01]"
                  >
                    <div className="flex items-start">
                      <div className="bg-blue-100 p-3 rounded-full mr-4 flex-shrink-0">
                        <FaBell className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium mb-3 text-lg">{notification.message}</p>
                        <div className="flex flex-wrap items-center text-sm text-gray-500 gap-4">
                          <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                            <FaCalendarAlt className="mr-2 text-blue-500" />
                            <span>{formatDate(notification.event_date)}</span>
                          </div>
                          <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                            <FaUser className="mr-2 text-blue-500" />
                            <span>{notification.teacher_name}</span>
                          </div>
                          <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                            <FaClock className="mr-2 text-blue-500" />
                            <span>{getTimeElapsed(notification.created_at || notification.event_date)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsStudents;