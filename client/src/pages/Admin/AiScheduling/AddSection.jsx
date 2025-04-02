import { useState, useEffect } from "react";
import { api2 } from "../../../api";
import { 
  FaLayerGroup, 
  FaBuilding, 
  FaBook, 
  FaUserTie, 
  FaDoorOpen, 
  FaClock, 
  FaCalendarWeek,
  FaSpinner,
  FaCheck,
  FaExclamationTriangle
} from "react-icons/fa";

export default function AddSection() {
  const [sectionData, setSectionData] = useState({
    section_id: "",
    department: "",
    num_class_in_week: "",
    course: "",
    instructor: "",
    room: "",
    meeting_time: "",
  });

  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [meetingTimes, setMeetingTimes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const deptRes = await api2.get("/api/departments/");
        setDepartments(deptRes.data);
        const courseRes = await api2.get("/api/courses/");
        setCourses(courseRes.data);
        const instructorRes = await api2.get("/api/instructors/");
        setInstructors(instructorRes.data);
        const roomRes = await api2.get("/api/rooms/");
        setRooms(roomRes.data);
        const meetingTimeRes = await api2.get("/api/meeting-times/");
        setMeetingTimes(meetingTimeRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessage("Failed to load form data. Please refresh the page.");
        setMessageType("error");
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setSectionData({ ...sectionData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    
    
    try {
      console.log(sectionData)
      await api2.post("/api/sections/add/", sectionData);
      setMessage("Section added successfully!");
      setMessageType("success");
      setSectionData({
        section_id: "",
        department: "",
        num_class_in_week: "",
        course: "",
        instructor: "",
        room: "",
        meeting_time: "",
      });
    } catch (error) {
      console.error("Error adding section:", error);
      setMessage("Failed to add section. Please try again.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-lg p-6">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <FaLayerGroup className="mr-3" /> Add New Section
        </h1>
        <p className="text-blue-100 mt-2">
          Create a new class section with instructor, room, and schedule
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-b-lg p-8">
        {message && (
          <div 
            className={`p-4 rounded-lg mb-6 flex items-center ${
              messageType === "error" 
                ? "bg-red-50 text-red-700 border-l-4 border-red-500" 
                : "bg-green-50 text-green-700 border-l-4 border-green-500"
            }`}
          >
            {messageType === "error" 
              ? <FaExclamationTriangle className="mr-2 text-red-500" /> 
              : <FaCheck className="mr-2 text-green-500" />
            }
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Section ID */}
            <div className="space-y-2">
              <label className="block text-gray-700 font-medium mb-1 flex items-center">
                <FaLayerGroup className="mr-2 text-indigo-500" /> Section ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="section_id"
                  value={sectionData.section_id}
                  onChange={handleChange}
                  placeholder="e.g. CS101-A"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLayerGroup className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <label className="block text-gray-700 font-medium mb-1 flex items-center">
                <FaBuilding className="mr-2 text-indigo-500" /> Department
              </label>
              <div className="relative">
                <select 
                  name="department" 
                  value={sectionData.department} 
                  onChange={handleChange} 
                  required 
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200 appearance-none bg-white"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept, index) => (
                    <option key={`${dept.dept_name}-${index}`} value={dept.dept_name}>
                    {dept.dept_name}
                  </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaBuilding className="text-gray-400" />
                </div>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Number of Classes Per Week */}
            <div className="space-y-2">
              <label className="block text-gray-700 font-medium mb-1 flex items-center">
                <FaCalendarWeek className="mr-2 text-indigo-500" /> Classes Per Week
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="num_class_in_week"
                  value={sectionData.num_class_in_week}
                  onChange={handleChange}
                  placeholder="Number of sessions"
                  min="1"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarWeek className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Course */}
            <div className="space-y-2">
              <label className="block text-gray-700 font-medium mb-1 flex items-center">
                <FaBook className="mr-2 text-indigo-500" /> Course
              </label>
              <div className="relative">
                <select 
                  name="course" 
                  value={sectionData.course} 
                  onChange={handleChange} 
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200 appearance-none bg-white"
                >
                  <option value="">Select Course</option>
                  {courses.map((course,index) => (
                    <option key={`${course.course_name}-${index}`} value={course.course_name}>
                    {course.course_name}
                  </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaBook className="text-gray-400" />
                </div>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Instructor */}
            <div className="space-y-2">
              <label className="block text-gray-700 font-medium mb-1 flex items-center">
                <FaUserTie className="mr-2 text-indigo-500" /> Instructor
              </label>
              <div className="relative">
                <select 
                  name="instructor" 
                  value={sectionData.instructor} 
                  onChange={handleChange} 
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200 appearance-none bg-white"
                >
                  <option value="">Select Instructor</option>
                  {instructors.map((inst,index) => (
                    <option key={`${inst.name}-${index}`} value={inst.name}>
                    {inst.name}
                  </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUserTie className="text-gray-400" />
                </div>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Room */}
            <div className="space-y-2">
              <label className="block text-gray-700 font-medium mb-1 flex items-center">
                <FaDoorOpen className="mr-2 text-indigo-500" /> Room
              </label>
              <div className="relative">
                <select 
                  name="room" 
                  value={sectionData.room} 
                  onChange={handleChange} 
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200 appearance-none bg-white"
                >
                  <option value="">Select Room</option>
                  {rooms.map((room,index) => (
                    <option key={`${room.r_number}-${index}`} value={room.r_number}>
                    {room.r_number}
                  </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaDoorOpen className="text-gray-400" />
                </div>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Meeting Time */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-gray-700 font-medium mb-1 flex items-center">
                <FaClock className="mr-2 text-indigo-500" /> Meeting Time
              </label>
              <div className="relative">
                <select 
                  name="meeting_time" 
                  value={sectionData.meeting_time} 
                  onChange={handleChange} 
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200 appearance-none bg-white"
                >
                                    <option value="">Select Meeting Time</option>
                  {meetingTimes.map((mt,index) => (
                    <option key={`${mt.day}-${mt.time}-${index}`} value={mt.time}>
                    {mt.day} - {mt.time}
                  </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaClock className="text-gray-400" />
                </div>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition duration-300 font-medium text-lg flex items-center justify-center disabled:opacity-70 mt-4"
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" /> Processing...
              </>
            ) : (
              <>
                <FaLayerGroup className="mr-2" /> Add Section
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}