import React, { useEffect, useState } from "react";
import api from "../../api";
import { FaPlus,FaSearch, FaEdit, FaTrash, FaSave, FaTimes, FaChevronLeft, FaChevronRight, FaGraduationCap, FaSpinner } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminEditPos() {
  const [selectedBranch, setSelectedBranch] = useState("");
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editPoData, setEditPoData] = useState({ po_name: "", po_body: "" });
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newPoData, setNewPoData] = useState({ po_id: "", po_name: "", po_body: "" });
  const [branch, setBranch] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch POs when branch changes
  useEffect(() => {
    if (selectedBranch) {
      fetchPOs();
    }
  }, [selectedBranch]);

  // Fetch branches on component mount
  useEffect(() => {
    fetchBranches();
  }, []);

  // Adjust rows per page based on screen height
  useEffect(() => {
    const handleResize = () => {
      const height = window.innerHeight;
      if (height > 800) setRowsPerPage(10);
      else if (height > 600) setRowsPerPage(7);
      else setRowsPerPage(5);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate total pages when data or rows per page changes
  useEffect(() => {
    if (responseData) {
      setTotalPages(Math.ceil(responseData.length / rowsPerPage));
      if (currentPage > Math.ceil(responseData.length / rowsPerPage)) {
        setCurrentPage(1);
      }
    }
  }, [responseData, rowsPerPage]);

  const fetchPOs = async () => {
    try {
      setLoading(true);
      const response = await api.post("api/pos/show", { branch: selectedBranch });
      // Sort the data by po_id before setting it in the state
      const sortedData = response.data.sort((a, b) => Number(a.po_id) - Number(b.po_id));
      setResponseData(sortedData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching POs:", error);
      toast.error("Failed to fetch Program Outcomes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/branch/show`);
      setBranch(response.data);
    } catch (error) {
      console.error("Error fetching branches:", error);
      toast.error("Failed to fetch branches. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    setSelectedBranch(event.target.value);
    setSearchTerm("");
  };

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const startEdit = (index) => {
    const actualIndex = (currentPage - 1) * rowsPerPage + index;
    setEditingIndex(actualIndex);
    setEditPoData(responseData[actualIndex]);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditPoData((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async () => {
    const actualIndex = editingIndex;
    
    try {
      setLoading(true);
      await api.post("api/pos/admin/update/", { 
        ...editPoData, 
        branch: selectedBranch 
      });
      
      const updatedData = [...responseData];
      updatedData[actualIndex] = { ...editPoData };
      setResponseData(updatedData);
      setEditingIndex(null);
      
      toast.success("Program Outcome updated successfully!");
    } catch (error) {
      console.error("Error updating PO:", error);
      toast.error("Failed to update Program Outcome. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deletePo = async (index) => {
    const actualIndex = (currentPage - 1) * rowsPerPage + index;
    
    if (actualIndex < 0 || actualIndex >= responseData.length) {
      console.error("Invalid index for deletion:", actualIndex);
      return;
    }

    const itemToDelete = responseData[actualIndex];
    const { po_id } = itemToDelete;
    
    if (window.confirm("Are you sure you want to delete this Program Outcome?")) {
      try {
        setLoading(true);
        await api.delete("api/pos/admin/delete", {
          data: { po_id, branch: selectedBranch }
        });
        
        const updatedData = responseData.filter((_, i) => i !== actualIndex);
        setResponseData(updatedData);
        
        toast.success("Program Outcome deleted successfully!");
      } catch (error) {
        console.error("Error deleting PO:", error);
        toast.error("Failed to delete Program Outcome. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddNewClick = () => {
    setIsAddingNew(true);
    setNewPoData({ po_id: "", po_name: "", po_body: "" });
  };

  const handleNewPoChange = (e) => {
    const { name, value } = e.target;
    setNewPoData((prev) => ({
      ...prev,
      [name]: name === "po_id" ? value : value
    }));
  };

  const saveNewPo = async () => {
    if (!newPoData.po_name || !newPoData.po_body || !newPoData.po_id) {
      toast.warning("Please fill in all fields");
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.post("api/pos/admin/create", { 
        ...newPoData, 
        branch: selectedBranch 
      });
      
      const newPo = { ...response.data, po_id: Number(response.data.po_id) };
      setResponseData((prevData) => {
        const updatedData = [...prevData, newPo].sort((a, b) => a.po_id - b.po_id);
        return updatedData;
      });
      
      setIsAddingNew(false);
      toast.success("New Program Outcome added successfully!");
    } catch (error) {
      console.error("Error adding new PO:", error);
      toast.error("Failed to add new Program Outcome. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const cancelAddNew = () => {
    setIsAddingNew(false);
  };

  // Filter data based on search term
    // Filter data based on search term
    const filteredData = responseData 
    ? responseData.filter(po => 
        (po.po_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
        (po.po_body?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      )
    : [];

  const paginatedData = filteredData?.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const getBranchName = (id) => {
    const foundBranch = branch.find(b => b.idbranch === parseInt(id));
    return foundBranch ? foundBranch.branchname : "Unknown Branch";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div 
        className="max-w-6xl mx-auto"
      >
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mt-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8">
            <div className="flex items-center justify-center">
              <FaGraduationCap className="text-white text-4xl mr-4" />
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Program Outcomes Management
              </h1>
            </div>
            <p className="mt-2 text-center text-blue-100">
              Create, edit, and manage Program Outcomes for different branches
            </p>
          </div>

          {/* Branch Selection */}
          <div className="px-6 py-6 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Branch
            </label>
            <select
              onChange={handleChange}
              value={selectedBranch}
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Select a branch</option>
              {branch.map((b) => (
                <option key={b.idbranch} value={b.idbranch}>
                  {b.branchname}
                </option>
              ))}
            </select>
          </div>

          {selectedBranch && (
            <div className="px-6 py-4">
              {/* Actions Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
                <div className="flex items-center">
                  <button
                    onClick={handleAddNewClick}
                    disabled={isAddingNew || loading}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaPlus className="mr-2" />
                    Add New PO
                  </button>
                  {selectedBranch && (
                    <div className="ml-4 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
                      Branch: {getBranchName(selectedBranch)}
                    </div>
                  )}
                </div>
                
                <div className="relative w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Search POs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Add New PO Form */}
              <AnimatePresence>
                {isAddingNew && (
                  <div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-blue-50 p-6 rounded-lg mb-6 border border-blue-100">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-blue-800">Add New Program Outcome</h3>
                        <button 
                          onClick={cancelAddNew}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <FaTimes />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            PO ID
                          </label>
                          <input
                            type="text"
                            name="po_id"
                            value={newPoData.po_id}
                            onChange={handleNewPoChange}
                            placeholder="e.g. 1, 2, 3..."
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            PO Name
                          </label>
                          <input
                            type="text"
                            name="po_name"
                            value={newPoData.po_name}
                            onChange={handleNewPoChange}
                            placeholder="e.g. PO1, PO2..."
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          PO Description
                        </label>
                        <textarea
                          name="po_body"
                          value={newPoData.po_body}
                          onChange={handleNewPoChange}
                          placeholder="Enter the description of the Program Outcome..."
                          rows="3"
                          className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          onClick={cancelAddNew}
                          className="px-4 py-2 border border-gray-300 text-gray-700                   rounded-md mr-2 hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveNewPo}
                          disabled={loading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                        >
                          {loading ? (
                            <>
                              <FaSpinner className="animate-spin mr-2" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <FaSave className="mr-2" />
                              Save
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </AnimatePresence>

              {/* PO Table */}
              {loading && !paginatedData?.length ? (
                <div className="flex justify-center items-center py-20">
                  <FaSpinner className="animate-spin text-blue-500 text-4xl" />
                </div>
              ) : paginatedData?.length > 0 ? (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                          PO ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                          PO Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedData.map((pos, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {pos.po_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {editingIndex === (currentPage - 1) * rowsPerPage + index ? (
                              <input
                                type="text"
                                name="po_name"
                                value={editPoData.po_name}
                                onChange={handleEditChange}
                                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            ) : (
                              pos.po_name
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {editingIndex === (currentPage - 1) * rowsPerPage + index ? (
                              <textarea
                                name="po_body"
                                value={editPoData.po_body}
                                onChange={handleEditChange}
                                rows="3"
                                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            ) : (
                              pos.po_body
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            <div className="flex justify-center space-x-2">
                              {editingIndex === (currentPage - 1) * rowsPerPage + index ? (
                                <>
                                  <button
                                    onClick={cancelEdit}
                                    className="p-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                                    title="Cancel"
                                  >
                                    <FaTimes />
                                  </button>
                                  <button
                                    onClick={saveEdit}
                                    disabled={loading}
                                    className="p-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors"
                                    title="Save"
                                  >
                                    {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startEdit(index)}
                                    className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
                                    title="Edit"
                                  >
                                    <FaEdit />
                                  </button>
                                  <button
                                    onClick={() => deletePo(index)}
                                    className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                                    title="Delete"
                                  >
                                    <FaTrash />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 bg-white rounded-lg shadow">
                  <p className="text-gray-500">No Program Outcomes found for this branch.</p>
                  <button
                    onClick={handleAddNewClick}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Add Your First PO
                  </button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 bg-white px-4 py-3 rounded-lg shadow">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={handlePrevious}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={currentPage === totalPages}
                      className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span> to{" "}
                        <span className="font-medium">
                          {Math.min(currentPage * rowsPerPage, filteredData.length)}
                        </span>{" "}
                        of <span className="font-medium">{filteredData.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={handlePrevious}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === 1
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          <FaChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>
                        
                        {/* Page numbers would go here */}
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium">
                          Page {currentPage} of {totalPages}
                        </span>
                        
                        <button
                          onClick={handleNext}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === totalPages
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          <FaChevronRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}