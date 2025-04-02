import { useState, useEffect } from "react";
import { api2 } from "../../../api";
import { FaBuilding, FaBook, FaSpinner, FaCheck, FaExclamationTriangle } from "react-icons/fa";

const AddDepartment = () => {
  const [deptName, setDeptName] = useState("");
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api2.get("/api/courses/");
        console.log(response.data)
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);
  console.log(selectedCourses)
    try {
        await api2.post("/api/departments/add/", {
        dept_name: deptName,
        courses: selectedCourses,
      });

      setMessage("Department added successfully!");
      setDeptName("");
      setSelectedCourses([]);
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
          <FaBuilding className="mr-3" /> Add New Department
        </h2>
        <p className="text-indigo-100 mt-2">
          Create a new department and assign courses
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
              <FaBuilding className="mr-2 text-indigo-500" /> Department Name
            </label>
            <input
              type="text"
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200"
              placeholder="e.g. Computer Science"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-gray-700 font-medium mb-1 flex items-center">
              <FaBook className="mr-2 text-indigo-500" /> Courses
            </label>
            <p className="text-sm text-gray-500 mb-2 italic">
              Hold Ctrl/Cmd to select multiple courses
            </p>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <select
                multiple
                value={selectedCourses}
                onChange={(e) => setSelectedCourses([...e.target.selectedOptions].map(o => o.value))}
                className="w-full px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none h-60"
              >
                {courses.length === 0 ? (
                  <option disabled>Loading courses...</option>
                ) : (
                  courses.map((course) => (
                    <option key={course.course_number} value={course.course_number} className="py-1">
                      {course.course_name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="text-sm text-gray-500 mt-2 flex items-center">
              <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full mr-2">
                {selectedCourses.length}
              </span>
              {selectedCourses.length === 1 
                ? "course selected" 
                : "courses selected"}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-indigo-800 transition duration-300 font-medium text-lg flex items-center justify-center disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" /> Processing...
              </>
            ) : (
              <>
                <FaBuilding className="mr-2" /> Add Department
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDepartment;