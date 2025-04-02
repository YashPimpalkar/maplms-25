import { useState } from "react";
import { api2 } from "../../../api";
import { FaClock, FaCalendarAlt, FaFingerprint, FaSpinner, FaCheck, FaExclamationTriangle } from "react-icons/fa";

const AddMeetingTime = () => {
  const [pid, setPid] = useState("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      await api2.post("/api/meeting-times/add/", { pid, day, time });
      setMessage("Meeting time added successfully!");
      setPid("");
      setDay("");
      setTime("");
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.error || "Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-lg p-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <FaClock className="mr-3" /> Add Meeting Time
        </h2>
        <p className="text-blue-100 mt-2">
          Schedule new meeting times for courses
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-b-lg p-8">
        {message && (
          <div 
            className={`p-4 rounded-lg mb-6 flex items-center ${
              message.includes("error") 
                ? "bg-red-50 text-red-700 border-l-4 border-red-500" 
                : "bg-green-50 text-green-700 border-l-4 border-green-500"
            }`}
          >
            {message.includes("error") 
              ? <FaExclamationTriangle className="mr-2 text-red-500" /> 
              : <FaCheck className="mr-2 text-green-500" />
            }
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-gray-700 font-medium mb-1 flex items-center">
              <FaFingerprint className="mr-2 text-blue-500" /> Period ID (PID)
            </label>
            <div className="relative">
              <input
                type="text"
                value={pid}
                onChange={(e) => setPid(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                placeholder="Enter unique period identifier"
                required
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFingerprint className="text-gray-400" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-gray-700 font-medium mb-1 flex items-center">
              <FaCalendarAlt className="mr-2 text-blue-500" /> Day
            </label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 bg-white"
              required
            >
              <option value="" disabled>Select a day</option>
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaCalendarAlt className="text-gray-400" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-gray-700 font-medium mb-1 flex items-center">
              <FaClock className="mr-2 text-blue-500" /> Time
            </label>
            <div className="relative">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                required
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaClock className="text-gray-400" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Enter time in 24-hour format (e.g., 14:30)
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg hover:from-cyan-700 hover:to-blue-800 transition duration-300 font-medium text-lg flex items-center justify-center disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" /> Processing...
              </>
            ) : (
              <>
                <FaClock className="mr-2" /> Add Meeting Time
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMeetingTime;