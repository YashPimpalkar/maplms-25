import { useState } from "react";
import { api2 } from "../../../api";
import { FaUserTie, FaIdCard, FaUser, FaSpinner, FaCheck, FaExclamationTriangle } from "react-icons/fa";

const AddInstructor = () => {
  const [uid, setUid] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);
    
    try {
      await api2.post("/api/addinstructor/", { uid, name });
      setMessage("Instructor added successfully!");
      setUid(""); // Reset input fields
      setName("");
    } catch (error) {
      console.log(error);
      setMessage("Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-lg p-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <FaUserTie className="mr-3" /> Add New Instructor
        </h2>
        <p className="text-blue-100 mt-2">
          Register a new instructor in the system
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
            <label htmlFor="uid" className="block text-gray-700 font-medium mb-1 flex items-center">
              <FaIdCard className="mr-2 text-blue-500" /> Instructor UID
            </label>
            <div className="relative">
              <input
                type="text"
                id="uid"
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                placeholder="Enter instructor ID"
                required
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaIdCard className="text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="name" className="block text-gray-700 font-medium mb-1 flex items-center">
              <FaUser className="mr-2 text-blue-500" /> Instructor Name
            </label>
            <div className="relative">
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                placeholder="Enter full name"
                required
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-gray-400" />
              </div>
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
              <>
                <FaUserTie className="mr-2" /> Add Instructor
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddInstructor;