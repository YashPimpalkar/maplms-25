import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from "../../../api";
import LoadingButton from "../../../components/Loading/Loading";
import Pagination from "../../../components/Pagination/Pagination";
import { FaPlus, FaEdit, FaEye, FaSave, FaTimes } from 'react-icons/fa';

const User_course = ({ uid }) => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [loading, setLoading] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/usercourse/${uid}`);
        setData(res.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (uid) {
      fetchData();
    }
  }, [uid]);

  const handleGoToCourse = (usercourse_id, co_count) => {
    navigate(`/coform`, { state: { usercourse_id, co_count } });
  };

  const handleShowCos = (usercourse_id) => {
    navigate(`/cos`, { state: { usercourse_id } });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  const handleSaveClick = async (index, usercourse_id) => {
    try {
      setLoading(true);
      const response = await api.put(`/api/usercourse/${usercourse_id}`, editFormData);
      if (response.status === 200) {
        const updatedData = [...data];
        updatedData[index] = { ...updatedData[index], ...editFormData };
        setData(updatedData);
        setEditIndex(null);
      } else {
        console.error("Failed to update data, status:", response.status);
      }
    } catch (err) {
      console.error("Error saving data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    setEditIndex(null);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleEditClick = (usercourse_id, co_count) => {
    navigate('/addremovecos', {
      state: { usercourse_id, co_count },
    });
  };

  // Filter data based on search term
    // Filter data based on search term
    const filteredData = data.filter(item => 
      (item.course_name && item.course_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.branch && typeof item.branch === 'string' && item.branch.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.academic_year && item.academic_year.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="left-0 z-45 w-full mt-8 relative">
      <div className="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h1 className="text-3xl md:text-4xl text-blue-800 font-bold mb-4 md:mb-0">
              <span className="border-b-4 border-blue-500 pb-1">Your Courses</span>
            </h1>
            
            <div className="w-full md:w-1/3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="absolute right-3 top-2.5 text-gray-400">
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="text-gray-500 hover:text-gray-700">
                      <FaTimes />
                    </button>
                  )}
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingButton />
            </div>
          ) : (
            <>
              <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-600 to-blue-800">
                        <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider sticky left-0 bg-blue-700 z-10">
                          #
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider sticky left-14 bg-blue-700 z-10">
                          Course Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Semester
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Academic Year
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Branch
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                          CO Count
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.length > 0 ? (
                        currentItems.map((item, index) => (
                          <tr key={index} className="hover:bg-blue-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10 hover:bg-blue-50">
                              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800">
                                {indexOfFirstItem + index + 1}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-14 bg-white z-10 hover:bg-blue-50">
                              {item.course_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {editIndex === index ? (
                                <input
                                  type="text"
                                  name="semester"
                                  value={editFormData.semester}
                                  onChange={handleEditChange}
                                  className="border border-gray-300 p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              ) : (
                                <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {item.semester}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {editIndex === index ? (
                                <input
                                  type="text"
                                  name="academic_year"
                                  value={editFormData.academic_year}
                                  onChange={handleEditChange}
                                  className="border border-gray-300 p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              ) : (
                                item.academic_year
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {item.branch}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                {item.co_count}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {editIndex === index ? (
                                <div className="flex space-x-2">
                                  <button
                                    className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md transition-colors duration-200"
                                    onClick={() => handleSaveClick(index, item.usercourse_id)}
                                  >
                                    <FaSave /> Save
                                  </button>
                                  <button
                                    className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md transition-colors duration-200"
                                    onClick={handleCancelClick}
                                  >
                                    <FaTimes /> Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="flex flex-col md:flex-row gap-2">
                                  <button
                                    className="flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md transition-colors duration-200"
                                    onClick={() => handleGoToCourse(item.usercourse_id, item.co_count)}
                                  >
                                    <FaPlus /> Add CO's
                                  </button>
                                  <button
                                    className="flex items-center justify-center gap-1 bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-md transition-colors duration-200"
                                    onClick={() => handleEditClick(item.usercourse_id, item.co_count)}
                                  >
                                    <FaEdit /> Edit
                                  </button>
                                  <button
                                    className="flex items-center justify-center gap-1 bg-teal-500 hover:bg-teal-600 text-white px-3 py-2 rounded-md transition-colors duration-200"
                                    onClick={() => handleShowCos(item.usercourse_id)}
                                  >
                                    <FaEye /> View COs
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                            {searchTerm ? "No courses match your search" : "No courses found"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {totalPages > 0 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default User_course;