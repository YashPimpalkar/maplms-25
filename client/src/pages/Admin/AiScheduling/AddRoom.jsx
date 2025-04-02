import { useState } from "react";
import { api2 } from "../../../api";
import { FaDoorOpen, FaChair, FaBuilding, FaSpinner, FaCheck, FaExclamationTriangle } from "react-icons/fa";

const AddRoom = () => {
  const [rNumber, setRNumber] = useState("");
  const [seatingCapacity, setSeatingCapacity] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messageType, setMessageType] = useState(""); // "success" or "error"

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      await api2.post("/api/rooms/add/", {
        r_number: rNumber,
        seating_capacity: seatingCapacity,
      });

      setMessage("Room added successfully!");
      setMessageType("success");
      setRNumber(""); // Reset input fields
      setSeatingCapacity("");
    } catch (error) {
      console.log(error);
      setMessage("Server error. Please try again.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-lg p-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <FaBuilding className="mr-3" /> Add New Room
        </h2>
        <p className="text-blue-100 mt-2">
          Register a new classroom in the system
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-b-lg p-8">
        {message && (
          <div 
            className={`p-4 rounded-lg mb-6 flex items-center ${
              messageType === "error" 
                ? "bg-red-50 text-red-700 border-l-4 border-red-500" 
                : "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
            }`}
          >
            {messageType === "error" 
              ? <FaExclamationTriangle className="mr-2 text-red-500" /> 
              : <FaCheck className="mr-2 text-blue-500" />
            }
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-gray-700 font-medium mb-1 flex items-center">
              <FaDoorOpen className="mr-2 text-indigo-600" /> Room Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={rNumber}
                onChange={(e) => setRNumber(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200"
                placeholder="e.g. A101, SB220"
                required
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaDoorOpen className="text-gray-400" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-gray-700 font-medium mb-1 flex items-center">
              <FaChair className="mr-2 text-indigo-600" /> Seating Capacity
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                value={seatingCapacity}
                onChange={(e) => setSeatingCapacity(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200"
                placeholder="Number of seats available"
                required
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaChair className="text-gray-400" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Enter the maximum number of students that can be accommodated
            </p>
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
                <FaBuilding className="mr-2" /> Add Room
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddRoom;