import React, { useState, useEffect } from "react";
import api from "../../api";
import { FaTasks, FaStar, FaSpinner, FaExclamationTriangle } from "react-icons/fa";

const AnimatedProgressBar = ({ usercourseid }) => {
  const [displayedProgress, setDisplayedProgress] = useState(0); // State for displaying progress
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null); // State for error handling

  useEffect(() => {
    // Update the displayed progress smoothly over time based on data
    if (data) {
      const overallProgress = (data.points / data.counter) * 100;
      setDisplayedProgress(overallProgress);
    }
  }, [data]); // This hook runs whenever `data` changes.

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error state before fetching
        const res = await api.get(`/api/reports/getprogress/${usercourseid}`);
        setData(res.data); // Assume data contains { counter, points }
      } catch (err) {
        console.error("Error fetching progress data:", err);
        setError("Error fetching progress data. Please try again."); // Set error message
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [usercourseid]);

  // Debugging the fetched data
  console.log(data);

  // Determine progress color based on percentage
  const getProgressColor = () => {
    if (displayedProgress < 30) return "bg-red-500";
    if (displayedProgress < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="w-full max-w-sm mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="p-2 bg-indigo-100 rounded-lg mr-3">
            <FaTasks className="text-indigo-600 text-lg" />
          </div>
          <span className="text-lg font-semibold text-gray-800">
            Task Progress
          </span>
        </div>
        <span className="text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-800">
          {loading ? (
            <span className="flex items-center text-blue-600">
              <FaSpinner className="animate-spin mr-1" /> Loading...
            </span>
          ) : error ? (
            <span className="flex items-center text-red-600">
              <FaExclamationTriangle className="mr-1" /> Error
            </span>
          ) : (
            `${Math.round(displayedProgress)}%`
          )}
        </span>
      </div>

      {/* Unified Overall Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden mb-4">
        <div
          className={`${getProgressColor()} h-4 rounded-full transition-all duration-1000 ease-out`}
          style={{ 
            width: `${Math.round(displayedProgress)}%`,
            boxShadow: "0 0 10px rgba(0,0,0,0.1) inset"
          }}
        ></div>
      </div>

      {/* Display Points and Counter */}
      {data && !loading && !error && (
        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center bg-indigo-50 px-3 py-2 rounded-lg">
            <FaStar className="text-yellow-500 mr-2" />
            <div>
              <span className="text-xs text-gray-500 block">Points Earned</span>
              <span className="text-gray-800 font-bold">{data.points}</span>
            </div>
          </div>
          <div className="h-8 w-px bg-gray-200"></div>
          <div className="flex items-center bg-indigo-50 px-3 py-2 rounded-lg">
            <div className="text-right">
              <span className="text-xs text-gray-500 block">Total Tasks</span>
              <span className="text-gray-800 font-bold">{data.counter}</span>
            </div>
          </div>
        </div>
      )}

      {/* Error Message Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          <div className="flex items-center">
            <FaExclamationTriangle className="mr-2" />
            {error}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimatedProgressBar;