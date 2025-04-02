import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import api from "../../../api";
import { FaSave, FaPlus, FaMinus } from "react-icons/fa";

export default function Cos_reg() {
  const location = useLocation();
  const [coCount, setCoCount] = useState(location.state?.co_count || 0);
  const { usercourse_id } = location.state;
  const [formData, setFormData] = useState(
    Array.from({ length: coCount }, (_, index) => ({
      cos_name: `CO${index + 1}`,
      cos_body: "",
    }))
  );

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Handle co_count change and adjust formData accordingly
  const handleCoCountChange = (e) => {
    const value = e.target.value;
    const newCount = value === "" ? "" : Math.min(Math.max(parseInt(value), 1), 10);
  
    setCoCount(newCount);
  
    if (newCount > formData.length) {
      // Add new fields if count increases
      const newFields = Array.from(
        { length: newCount - formData.length },
        (_, index) => ({
          cos_name: `CO${formData.length + index + 1}`,
          cos_body: "",
        })
      );
      setFormData([...formData, ...newFields]);
    } else if (newCount !== "") {
      // Remove extra fields if count decreases
      setFormData(formData.slice(0, newCount));
    }
  };
  
  // Increment/decrement CO count
  const adjustCoCount = (amount) => {
    const newCount = Math.min(Math.max(parseInt(coCount) + amount, 1), 10);
    setCoCount(newCount);
    
    if (amount > 0) {
      // Add new field
      const newField = {
        cos_name: `CO${formData.length + 1}`,
        cos_body: "",
      };
      setFormData([...formData, newField]);
    } else {
      // Remove last field
      setFormData(formData.slice(0, -1));
    }
  };
  
  // Handle input field change
  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const updatedFormData = [...formData];
    updatedFormData[index] = { ...updatedFormData[index], [name]: value };
    setFormData(updatedFormData);
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setLoading(true);
      console.log(formData)
      const response = await api.post("/api/cos/add", { formData, usercourse_id });
      console.log("Successfully added COS records:", response.data);
      setSuccessMessage(response.data.message || "COS records added successfully!");
      setErrorMessage("");
    } catch (error) {
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.error || "An unknown error occurred.");
      } else {
        setErrorMessage("There was an error saving the COS records. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="left-0 z-45 w-full mt-8">
      <div className="max-w-screen-lg mx-auto p-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-xl">
        <h1 className="text-3xl font-bold mb-6 text-blue-800 text-center border-b-4 border-blue-500 pb-2 inline-block mx-auto">
          Course Outcome Statements
        </h1>

        {errorMessage && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
            <p className="font-medium">Error</p>
            <p>{errorMessage}</p>
          </div>
        )}
        
        {successMessage && (
          <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md">
            <p className="font-medium">Success</p>
            <p>{successMessage}</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          {/* Editable CO Count with increment/decrement buttons */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700 mb-2">Number of Course Outcomes</label>
            <div className="flex items-center">
              <button 
                onClick={() => adjustCoCount(-1)}
                disabled={coCount <= 1}
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-l-md disabled:opacity-50"
              >
                <FaMinus />
              </button>
              <input
                type="number"
                value={coCount}
                onChange={handleCoCountChange}
                className="text-center w-16 border-t border-b border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={1}
                max={10}
              />
              <button 
                onClick={() => adjustCoCount(1)}
                disabled={coCount >= 10}
                className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-r-md disabled:opacity-50"
              >
                <FaPlus />
              </button>
              <span className="ml-3 text-gray-500 text-sm">
                (Min: 1, Max: 10)
              </span>
            </div>
          </div>

          <form className="space-y-6">
            {formData.map((cos, index) => (
              <div 
                key={index} 
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 bg-gray-50"
              >
                <h3 className="text-lg font-semibold text-blue-700 mb-3">Course Outcome {index + 1}</h3>
                <div className="flex flex-wrap -mx-2 mb-4">
                  <div className="w-full sm:w-1/3 px-3 mb-4 sm:mb-0">
                    <label
                      htmlFor={`cos_name_${index}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      CO Identifier
                    </label>
                    <input
                      type="text"
                      id={`cos_name_${index}`}
                      name="cos_name"
                      value={cos.cos_name}
                      onChange={(e) => handleChange(index, e)}
                      className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      style={{ textTransform: "uppercase" }}
                    />
                  </div>

                  <div className="w-full sm:w-2/3 px-3">
                    <label 
                      htmlFor={`cos_body_${index}`} 
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      CO Description
                    </label>
                    <textarea
                      id={`cos_body_${index}`}
                      name="cos_body"
                      value={cos.cos_body}
                      onChange={(e) => handleChange(index, e)}
                      rows="1"
                      placeholder="Enter the course outcome description..."
                      className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-lg font-medium disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Save Course Outcomes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}