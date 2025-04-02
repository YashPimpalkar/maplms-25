import React, { useEffect, useState } from "react";
import api from "../../../api";
import { FaChevronLeft, FaChevronRight, FaBook, FaSearch, FaSpinner } from "react-icons/fa";

export default function ShowPos() {
  const [selectedBranch, setSelectedBranch] = useState("");
  const [responseData, setResponseData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5); // Default rows per page
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedBranch) {
      setLoading(true);
      api
        .post("api/pos/show", { branch: selectedBranch })
        .then((response) => {
          console.log(response.data);
          setResponseData(response.data);
          setCurrentPage(1); // Reset to first page when branch changes
          setErrorMessage("");
        })
        .catch((error) => {
          console.error("Error making the POST request:", error);
          setErrorMessage("Error fetching data. Please try again.");
          setResponseData(null);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [selectedBranch]);

  useEffect(() => {
    const handleResize = () => {
      const height = window.innerHeight;
      if (height > 800) setRowsPerPage(10);
      else if (height > 600) setRowsPerPage(7);
      else setRowsPerPage(5);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (responseData) {
      setTotalPages(Math.ceil(responseData.length / rowsPerPage));
    }
  }, [responseData, rowsPerPage]);

  const handleChange = (event) => {
    setSelectedBranch(event.target.value);
  };

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const paginatedData = responseData?.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const formatPoBody = (poBody) => {
    const [boldPart, ...rest] = poBody.split(":");
    return (
      <>
        <span className="font-bold">{boldPart}:</span>
        {rest.join(":")}
      </>
    );
  };

  const getBranchName = (branchId) => {
    switch(branchId) {
      case "1": return "Computer Engineering";
      case "2": return "Information Technology";
      case "3": return "Artificial Intelligence & Machine Learning";
      default: return "Selected Branch";
    }
  };

  return (
    <div className="left-0 z-45 w-full mt-8">
      <div className="max-w-screen-lg mx-auto p-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-xl">
        <div className="flex items-center justify-center mb-6">
          <FaBook className="text-blue-600 text-3xl mr-3" />
          <h1 className="text-3xl font-bold text-blue-800 border-b-4 border-blue-500 pb-2">
            Program Outcomes
          </h1>
        </div>

        {errorMessage && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
            <p className="font-medium">Error</p>
            <p>{errorMessage}</p>
          </div>
        )}

        <div className="mb-8">
          <label htmlFor="branch-select" className="block text-lg font-medium text-gray-700 mb-2">
            Select Branch
          </label>
          <div className="relative">
            <select
              id="branch-select"
              onChange={handleChange}
              value={selectedBranch}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white pr-10"
            >
              <option value="">-- Select a branch --</option>
              <option value="1">Computer Engineering</option>
              <option value="2">Information Technology</option>
              <option value="3">AI & ML</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-blue-500 text-4xl" />
          </div>
        ) : (
          <>
            {selectedBranch && (
              <div className="bg-white p-4 rounded-lg shadow-md mb-6 border-l-4 border-blue-500">
                <h2 className="text-xl font-semibold text-gray-800">
                  {getBranchName(selectedBranch)}
                </h2>
                <p className="text-gray-600 mt-1">
                  Viewing program outcomes for this branch
                </p>
              </div>
            )}

            {responseData && responseData.length > 0 ? (
              <>
                <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                          <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider w-1/4">
                            PO Identifier
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider w-3/4">
                            PO Description
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedData.map((pos, index) => (
                          <tr key={index} className="hover:bg-blue-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {pos.po_name}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {formatPoBody(pos.po_body)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6">
                  <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 shadow-md hover:bg-blue-700 transition duration-200 disabled:cursor-not-allowed"
                  >
                    <FaChevronLeft className="mr-2" /> Previous
                  </button>
                  
                  <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                    <span className="text-gray-700">
                      Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                    </span>
                  </div>
                  
                  <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 shadow-md hover:bg-blue-700 transition duration-200 disabled:cursor-not-allowed"
                  >
                    Next <FaChevronRight className="ml-2" />
                  </button>
                </div>
              </>
            ) : (
              selectedBranch && !loading && (
                <div className="bg-white p-8 rounded-lg shadow-md text-center border border-gray-200">
                  <FaSearch className="mx-auto text-gray-400 text-5xl mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Program Outcomes Found</h3>
                  <p className="text-gray-500">
                    There are no program outcomes available for this branch.
                  </p>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}