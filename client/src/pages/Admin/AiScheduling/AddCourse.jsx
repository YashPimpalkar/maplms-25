import { useState, useEffect } from "react";
import { api2 } from "../../../api";
import { FaBook, FaUserTie, FaUsers, FaHashtag, FaSpinner } from "react-icons/fa";

const AddCourse = () => {
  const [courseNumber, setCourseNumber] = useState("");
  const [courseName, setCourseName] = useState("");
  const [maxStudents, setMaxStudents] = useState("");
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await api2.get("/api/instructors/");
        setInstructors(response.data);
      } catch (error) {
        console.error("Error fetching instructors:", error);
      }
    };
    fetchInstructors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      await api2.post("/api/courses/add/", {
        course_number: courseNumber,
        course_name: courseName,
        max_numb_students: maxStudents,
        instructors: selectedInstructors,
      });

      setMessage("Course added successfully!");
      setCourseNumber("");
      setCourseName("");
      setMaxStudents("");
      setSelectedInstructors([]);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.error || "Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-lg p-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <FaBook className="mr-3" /> Add New Course
        </h2>
        <p className="text-blue-100 mt-2">
          Create a new course and assign instructors
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
            <span className="text-lg mr-2">
              {message.includes("error") ? "⚠️" : "✅"}
            </span>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-gray-700 font-medium mb-1 flex items-center">
                <FaHashtag className="mr-2 text-blue-500" /> Course Number
              </label>
              <input
                type="text"
                value={courseNumber}
                onChange={(e) => setCourseNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                placeholder="e.g. CS101"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-gray-700 font-medium mb-1 flex items-center">
                <FaBook className="mr-2 text-blue-500" /> Course Name
              </label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                placeholder="e.g. Introduction to Computer Science"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-gray-700 font-medium mb-1 flex items-center">
              <FaUsers className="mr-2 text-blue-500" /> Maximum Students
            </label>
            <input
              type="number"
              value={maxStudents}
              onChange={(e) => setMaxStudents(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
              placeholder="e.g. 60"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-gray-700 font-medium mb-1 flex items-center">
              <FaUserTie className="mr-2 text-blue-500" /> Instructors
            </label>
            <p className="text-sm text-gray-500 mb-2 italic">
              Hold Ctrl/Cmd to select multiple instructors
            </p>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <select
                multiple
                value={selectedInstructors}
                onChange={(e) => setSelectedInstructors([...e.target.selectedOptions].map(o => o.value))}
                className="w-full px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none h-48"
              >
                {instructors.length === 0 ? (
                  <option disabled>Loading instructors...</option>
                ) : (
                  instructors.map((inst) => (
                    <option key={inst.id} value={inst.id} className="py-1">
                      {inst.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {selectedInstructors.length > 0 
                ? `${selectedInstructors.length} instructor${selectedInstructors.length > 1 ? 's' : ''} selected` 
                : 'No instructors selected'}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition duration-300 font-medium text-lg flex items-center justify-center disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" /> Processing...
              </>
            ) : (
              "Add Course"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCourse;