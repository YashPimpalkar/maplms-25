import React, { useState, useEffect } from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const [inputPage, setInputPage] = useState(currentPage);

  useEffect(() => {
    setInputPage(currentPage);
  }, [currentPage]);

  // Handle page input change
  const handleInputChange = (event) => {
    const page = Number(event.target.value);
    setInputPage(page);
  };

  // Handle page input submission
  const handleInputSubmit = (event) => {
    event.preventDefault();
    if (inputPage >= 1 && inputPage <= totalPages) {
      onPageChange(inputPage);
    }
  };

  // Handle previous and next buttons
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row items-center justify-between mt-4 mb-4">
      <div className="flex flex-col sm:flex-row sm:space-x-4 items-center sm:order-2">
        <form
          onSubmit={handleInputSubmit}
          className="flex items-center space-x-2 sm:order-2"
        >
          <span className="text-sm text-gray-700">Page</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={inputPage}
            onChange={handleInputChange}
            className="w-16 text-center border border-gray-300 rounded-md shadow-sm"
          />
          <span className="text-sm text-gray-700">of {totalPages}</span>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-500 text-white rounded-md"
          >
            Go
          </button>
        </form>
      </div>

      <div className="flex space-x-2 sm:order-1">
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-indigo-500 text-white rounded-md disabled:bg-gray-300"
        >
          First
        </button>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-indigo-500 text-white rounded-md disabled:bg-gray-300"
        >
          Previous
        </button>
      </div>

      <div className="flex space-x-2 sm:order-3">
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-indigo-500 text-white rounded-md disabled:bg-gray-300"
        >
          Next
        </button>
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-indigo-500 text-white rounded-md disabled:bg-gray-300"
        >
          Last
        </button>
      </div>
    </div>
  );
};

export default Pagination;
