import { useEffect, useState } from "react";
import { api2 } from "../../../api";
import { 
  FaTrash, 
  FaLayerGroup, 
  FaSearch, 
  FaExclamationCircle, 
  FaSpinner, 
  FaBuilding, 
  FaBook, 
  FaUserTie, 
  FaDoorOpen, 
  FaClock,
  FaCalendarWeek
} from "react-icons/fa";
import Pagination from "../../../components/Pagination/Pagination";

export default function SectionList() {
  const [sections, setSections] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteInProgress, setDeleteInProgress] = useState(null);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchSections = async () => {
      setIsLoading(true);
      try {
        const response = await api2.get("/api/sections/");
        setSections(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching sections:", error);
        setError("Failed to load sections. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSections();
  }, []);

  const handleDelete = async (sectionId) => {
    setDeleteInProgress(sectionId);
    try {
      await api2.delete(`/api/sections/delete/${sectionId}/`);
      setSections((prevSections) => prevSections.filter((sec) => sec.section_id !== sectionId));
    } catch (error) {
      console.error("Error deleting section:", error);
      alert("Failed to delete section. Please try again.");
    } finally {
      setDeleteInProgress(null);
    }
  };

  const filteredSections = sections.filter(
    (section) =>
      section.section_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (section.course && section.course.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (section.instructor && section.instructor.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredSections.length / itemsPerPage);
  const paginatedSections = filteredSections.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-lg p-6">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <FaLayerGroup className="mr-3" /> Section List
        </h1>
        <p className="text-blue-100 mt-2">
          View and manage all class sections
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-b-lg p-6">
        {/* Search Bar */}
        <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by ID, department, course or instructor..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <FaSpinner className="animate-spin text-indigo-600 text-2xl" />
            <span className="ml-2 text-gray-600">Loading sections...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center">
            <FaExclamationCircle className="mr-2" />
            {error}
          </div>
        ) : filteredSections.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            {searchTerm ? "No sections match your search" : "No sections available"}
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedSections.map((section) => (
              <div 
                key={section.section_id} 
                className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-indigo-700 flex items-center">
                    <FaLayerGroup className="mr-2 text-indigo-500" />
                    {section.section_id}
                  </h2>
                  <button
                    onClick={() => handleDelete(section.section_id)}
                    disabled={deleteInProgress === section.section_id}
                    className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                    title="Delete section"
                  >
                    {deleteInProgress === section.section_id ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaTrash />
                    )}
                  </button>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <FaBuilding className="text-gray-400 mt-1 mr-3 w-5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-600">Department</h3>
                      <p className="text-sm text-gray-800">{section.department}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaCalendarWeek className="text-gray-400 mt-1 mr-3 w-5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-600">Classes per Week</h3>
                      <p className="text-sm text-gray-800">{section.num_class_in_week}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaBook className="text-gray-400 mt-1 mr-3 w-5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-600">Course</h3>
                      <p className="text-sm text-gray-800">
                        {section.course || (
                          <span className="text-gray-500 italic">Not assigned</span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaUserTie className="text-gray-400 mt-1 mr-3 w-5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-600">Instructor</h3>
                      <p className="text-sm text-gray-800">
                        {section.instructor || (
                          <span className="text-gray-500 italic">Not assigned</span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaDoorOpen className="text-gray-400 mt-1 mr-3 w-5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-600">Room</h3>
                      <p className="text-sm text-gray-800">
                        {section.room || (
                          <span className="text-gray-500 italic">Not assigned</span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaClock className="text-gray-400 mt-1 mr-3 w-5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-600">Meeting Time</h3>
                      <p className="text-sm text-gray-800">
                        {section.meeting_time || (
                          <span className="text-gray-500 italic">Not assigned</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !error && filteredSections.length > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}