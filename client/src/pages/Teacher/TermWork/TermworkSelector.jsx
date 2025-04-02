import React, { useState, useEffect } from "react";
import CourseSelector from "../../../components/CourseSelector/CourseSelector";
import api from "../../../api";
import { FaClipboardCheck, FaBook, FaCheckCircle, FaSpinner } from "react-icons/fa";

const Termwork = ({ uid }) => {
  const [selectedCheckbox, setSelectedCheckbox] = useState(null);
  const [userCourseId, setUserCourseId] = useState(null);
  const [checkboxLabels, setCheckboxLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    if (userCourseId) {
      const fetchTermworkLabels = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/api/termwork/checkboxlabels/${userCourseId}`);
          const { labels, selectedTwid } = response.data;
          
          const selectedIndex = labels.findIndex(label => label.twid === selectedTwid);
          setCheckboxLabels(labels);
          setSelectedCheckbox(selectedIndex !== -1 ? selectedIndex : null);
        } catch (error) {
          console.error("Error fetching termwork labels:", error);
          showNotification("Failed to load assessment options", "error");
        } finally {
          setLoading(false);
        }
      };

      fetchTermworkLabels();
    }
  }, [userCourseId]);

  const handleCheckboxChange = (index) => {
    setSelectedCheckbox(index);
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleSubmit = async () => {
    if (!userCourseId || selectedCheckbox === null) {
      showNotification("Please select a course and an assessment option", "error");
      return;
    }

    try {
      setLoading(true);
      const selectedTermwork = checkboxLabels[selectedCheckbox];
      const response = await api.post("/api/termwork/submit", {
        userCourseId,
        tw_id: selectedTermwork.twid,
      });

      if (response.data.success) {
        showNotification("Assessment saved successfully!", "success");
      } else if (response.data.updated) {
        showNotification("Assessment updated successfully!", "success");
      } else {
        showNotification("Failed to save or update assessment", "error");
      }
    } catch (error) {
      console.error("Error submitting termwork:", error);
      showNotification("Error submitting assessment", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="left-0 z-45 w-full mt-8">
      <div className="min-h-screen flex flex-col items-center p-6">
        {/* Notification */}
        {notification.show && (
          <div 
            className={`fixed top-6 right-6 p-4 rounded-lg shadow-lg transition-all duration-300 z-50 ${
              notification.type === "success" 
                ? "bg-green-50 border-l-4 border-green-500 text-green-700" 
                : "bg-red-50 border-l-4 border-red-500 text-red-700"
            }`}
          >
            <div className="flex items-center">
              {notification.type === "success" ? (
                <FaCheckCircle className="mr-2" />
              ) : (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              <p>{notification.message}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center mb-4">
            <FaClipboardCheck className="text-blue-600 text-4xl mr-3" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl text-blue-700 font-bold">
              Assessment Selection
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select your course and choose the appropriate assessment type for your students
          </p>
        </div>

        {/* Course Selector Card */}
        <div className="w-full max-w-lg md:max-w-2xl lg:max-w-3xl mb-8">
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
              <FaBook className="mr-2" /> Select Course
            </h2>
            <CourseSelector uid={uid} onUserCourseIdChange={setUserCourseId} />
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center h-32 w-full">
            <FaSpinner className="animate-spin text-blue-600 text-3xl" />
          </div>
        )}

        {/* Assessment Options */}
        {userCourseId && checkboxLabels.length > 0 && !loading && (
          <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg md:max-w-2xl lg:max-w-3xl border border-gray-200">
            <h2 className="text-xl font-semibold text-blue-700 mb-6 flex items-center">
              <FaClipboardCheck className="mr-2" /> Select Assessment Type
            </h2>
            
            <div className="space-y-3">
              {checkboxLabels.map((labelData, index) => (
                <label
                  key={labelData.twid}
                  className={`flex items-center p-4 rounded-lg cursor-pointer transition-all border ${
                    selectedCheckbox === index
                      ? "bg-blue-50 border-blue-500 shadow-sm"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      selectedCheckbox === index 
                        ? "border-blue-600 bg-blue-600" 
                        : "border-gray-400"
                    }`}>
                      {selectedCheckbox === index && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedCheckbox === index}
                      onChange={() => handleCheckboxChange(index)}
                      className="sr-only" // Hide the actual checkbox
                    />
                  </div>
                  <span className="ml-3 text-gray-800 font-medium">
                    {labelData.twbody}
                  </span>
                </label>
              ))}
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-8 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200 disabled:opacity-70 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <FaCheckCircle className="mr-2" />
                  Save Assessment Selection
                </>
              )}
            </button>
          </div>
        )}

        {/* Empty state */}
        {userCourseId && checkboxLabels.length === 0 && !loading && (
          <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg md:max-w-2xl lg:max-w-3xl border border-gray-200 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessment Options Available</h3>
            <p className="text-gray-500">
              There are no assessment options available for this course yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Termwork;