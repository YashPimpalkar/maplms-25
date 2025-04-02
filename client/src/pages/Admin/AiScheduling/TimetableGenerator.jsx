import { useState, useEffect } from "react";
import { api2 } from "../../../api";
import { FaCalendarAlt, FaSync, FaSpinner, FaCheck, FaChalkboardTeacher, FaBuilding, FaUserTie, FaClock } from "react-icons/fa";

const TimetableGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ generation: 0, fitness: 0 });
  const [timetable, setTimetable] = useState([]);
  const [checkingProgress, setCheckingProgress] = useState(false);
  const [activeTab, setActiveTab] = useState("department");

  // Check progress automatically on component mount
  useEffect(() => {
    checkProgress();
    // Set up interval to check progress every 10 seconds if not complete
    const interval = setInterval(() => {
      if (progress.fitness < 1.0) {
        checkProgress();
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Generate Timetable
  const generateTimetable = async () => {
    setLoading(true);
    try {
      const response = await api2.get("/timetable_generation/");
      setTimetable(removeDuplicates(response.data.schedule));
    } catch (error) {
      console.error("Error generating timetable:", error);
    }
    setLoading(false);
  };

  // Check Progress
  const checkProgress = async () => {
    setCheckingProgress(true);
    try {
      const res = await api2.get("/api/timetable/progress/");
      setProgress(res.data);
      if (res.data.fitness === 1.0) {
        fetchTimetable();
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
    setCheckingProgress(false);
  };

  // Fetch Timetable
  const fetchTimetable = async () => {
    try {
      const res = await api2.get("/api/timetable/progress/");
      setTimetable(removeDuplicates(res.data.schedule));
    } catch (error) {
      console.error("Error fetching timetable:", error);
    }
  };

  // Remove duplicate entries
  const removeDuplicates = (schedule) => {
    const seen = new Set();
    return schedule.filter((entry) => {
      const key = `${entry.dept}-${entry.course}-${entry.room}-${entry.instructor}-${entry.meeting_time.join("-")}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  // Group data by department
  const groupByDepartment = () => {
    return timetable.reduce((acc, entry) => {
      const dept = entry.dept || "Unknown";
      if (!acc[dept]) acc[dept] = [];
      acc[dept].push(entry);
      return acc;
    }, {});
  };

  // Group data by room
  const groupByRoom = () => {
    return timetable.reduce((acc, entry) => {
      const room = entry.room || "Unknown";
      if (!acc[room]) acc[room] = [];
      acc[room].push(entry);
      return acc;
    }, {});
  };

  // Generate tables per department
  const departmentTables = () => {
    const departmentData = groupByDepartment();
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    return Object.keys(departmentData).map((dept) => {
      const instructors = [...new Set(departmentData[dept].map((entry) => entry.instructor))];
      
      return (
        <div key={dept} className="bg-white shadow-lg rounded-lg p-6 mb-8 mt-5 border border-gray-200">
          <div className="flex items-center mb-4">
            <FaBuilding className="text-indigo-600 text-xl mr-2" />
            <h2 className="text-2xl font-bold text-gray-800">{dept} Department</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-center">
              <thead>
                <tr className="bg-indigo-100">
                  <th className="border border-indigo-200 p-3 text-indigo-800">
                    <div className="flex items-center justify-center">
                      <FaUserTie className="mr-2" />
                      Instructor
                    </div>
                  </th>
                  {days.map((day) => (
                    <th key={day} className="border border-indigo-200 p-3 text-indigo-800">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {instructors.map((instructor) => (
                  <tr key={instructor} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 font-semibold bg-gray-50">{instructor}</td>
                    {days.map((day) => {
                      const entries = departmentData[dept].filter(
                        (entry) => entry.instructor === instructor && entry.meeting_time[1] === day
                      );
                      return (
                        <td key={day} className="border border-gray-300 p-2">
                          {entries.length > 0
                            ? entries.map((entry) => (
                                <div key={entry.course} className="p-2 bg-indigo-100 rounded-md mb-1 shadow-sm hover:shadow-md transition-shadow">
                                  <p className="text-sm font-semibold text-indigo-800">{entry.course}</p>
                                  <div className="flex items-center justify-center text-xs text-gray-600 mt-1">
                                    <FaBuilding className="mr-1" />
                                    {entry.room}
                                  </div>
                                  <div className="flex items-center justify-center text-xs text-gray-600">
                                    <FaClock className="mr-1" />
                                    {entry.meeting_time[2]}
                                  </div>
                                </div>
                              ))
                            : <span className="text-gray-400">-</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    });
  };

  // Generate tables per room
  const roomTables = () => {
    const roomData = groupByRoom();
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    return Object.keys(roomData).map((room) => {
      const timeSlots = [...new Set(roomData[room].map((entry) => entry.meeting_time[2]))].sort();
      
      return (
        <div key={room} className="bg-white shadow-lg rounded-lg p-6 mb-8 mt-5 border border-gray-200">
          <div className="flex items-center mb-4">
            <FaChalkboardTeacher className="text-green-600 text-xl mr-2" />
            <h2 className="text-2xl font-bold text-gray-800">Room {room}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-center">
              <thead>
                <tr className="bg-green-100">
                  <th className="border border-green-200 p-3 text-green-800">
                    <div className="flex items-center justify-center">
                      <FaClock className="mr-2" />
                      Time Slot
                    </div>
                  </th>
                  {days.map((day) => (
                    <th key={day} className="border border-green-200 p-3 text-green-800">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((timeSlot) => (
                  <tr key={timeSlot} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 font-semibold bg-gray-50">{timeSlot}</td>
                    {days.map((day) => {
                      const entries = roomData[room].filter(
                        (entry) => entry.meeting_time[2] === timeSlot && entry.meeting_time[1] === day
                      );
                      return (
                        <td key={day} className="border border-gray-300 p-2">
                          {entries.length > 0
                            ? entries.map((entry) => (
                                <div key={entry.course} className="p-2 bg-green-100 rounded-md mb-1 shadow-sm hover:shadow-md transition-shadow">
                                  <p className="text-sm font-semibold text-green-800">{entry.course}</p>
                                  <div className="flex items-center justify-center text-xs text-gray-600 mt-1">
                                    <FaUserTie className="mr-1" />
                                    {entry.instructor}
                                  </div>
                                  <div className="flex items-center justify-center text-xs text-gray-600">
                                    <FaBuilding className="mr-1" />
                                    {entry.dept}
                                  </div>
                                </div>
                              ))
                            : <span className="text-gray-400">-</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    });
  };

  // Calculate progress percentage
  const progressPercentage = Math.round(progress.fitness * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mt-10">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-t-lg p-6 text-white">
        <h1 className="text-3xl font-bold flex items-center justify-center">
          <FaCalendarAlt className="mr-3" /> AI Timetable Generator
        </h1>
        <p className="text-center mt-2 text-indigo-100">
          Automatically generate optimal class schedules using genetic algorithms
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-b-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex-1">
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-medium">Generation Progress</span>
                <span className="text-indigo-700 font-bold">{progress.generation}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-medium">Fitness Score</span>
                <span className="text-indigo-700 font-bold">{progress.fitness.toFixed(4)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 mt-3">
                <div 
                  className="bg-indigo-600 h-4 rounded-full transition-all duration-500 ease-out flex items-center justify-center text-xs text-white font-bold"
                  style={{ width: `${progressPercentage}%` }}
                >
                  {progressPercentage}%
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={generateTimetable}
              disabled={loading}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <FaSync className="mr-2" />
                  Generate Timetable
                </>
              )}
            </button>
            <button
              onClick={checkProgress}
              disabled={checkingProgress}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkingProgress ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Checking...
                </>
              ) : (
                <>
                  <FaCheck className="mr-2" />
                  Check Progress
                </>
              )}
            </button>
          </div>
        </div>

        {progress.fitness > 0 && (
          <div className="mb-6">
            <div className="border-b border-gray-200 mb-4">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab("department")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "department"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center">
                    <FaBuilding className="mr-2" />
                    Department View
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("room")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "room"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center">
                    <FaChalkboardTeacher className="mr-2" />
                    Room View
                  </div>
                </button>
              </nav>
            </div>

            {timetable.length > 0 ? (
              <div>
                {activeTab === "department" ? departmentTables() : roomTables()}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                No timetable data available yet. Generate a timetable to see results.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimetableGenerator;