import React, { useEffect, useState } from 'react';
import api from '../../api';

const NoCosAttainment = ({ NOCOData, userCourseId }) => {
  const [CosData, setCosData] = useState(null); // State to hold fetched COS data
  const [loading, setLoading] = useState(true); // State to manage loading
  const [error, setError] = useState(null); // State to manage errors

  useEffect(() => {
    const fetchCosData = async () => {
      setLoading(true); // Set loading state before fetching
      setError(null); // Clear any previous errors

      try {
        const response = await api.post(`/api/cos/${userCourseId}`); // API call to fetch COS data
        setCosData(response.data); // Set the fetched data into state
      } catch (err) {
        console.error("Error fetching COS data:", err);
        setError("Failed to load COS data."); // Handle error if the fetch fails
      } finally {
        setLoading(false); // Set loading state to false after data is fetched
      }
    };

    if (userCourseId) {
      fetchCosData(); // Fetch data if userCourseId is available
    }
  }, [userCourseId]);

  if (loading) {
    return <div>Loading...</div>; // Show loading message during the fetch process
  }

  if (error) {
    return <div>{error}</div>; // Show error message if fetch fails
  }

  // Merge the NOCOData with CosData based on CO names
  const mergedData = CosData?.map((cos) => {
    // Find the corresponding NOCOData entry based on the cos_name
 

    // Assign the percentageAboveThreshold from NOCOData to the cos name
    const percentageAboveThreshold = NOCOData[0].percentageAboveThreshold || 0 ;

    // Categorize based on the percentageAboveThreshold
    const averagePercentage = parseFloat(percentageAboveThreshold);
    let categorization;
    if (averagePercentage < 40) {
      categorization = 0; // Category 0 for < 40%
    } else if (averagePercentage <= 60) {
      categorization = 1; // Category 1 for <= 60%
    } else if (averagePercentage <= 70) {
      categorization = 2; // Category 2 for <= 70%
    } else {
      categorization = 3; // Category 3 for > 70%
    }

    return {
      ...cos,
      cosname: cos.co_name,
      averagePercentage:percentageAboveThreshold,
      categorization,
    };
  });


  const handleSaveToDataStorage = async () => {
    try {
      const response = await api.post("/api/attainment/update", {
        userCourseId,
        selectedCurriculumId:3,
        attainmentData: mergedData,
      });
      if (response.status === 200) {
        alert("Data saved successfully!");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to save data. Please try again.");
    }
  };

  return (
    <div >
      <h2 className="text-lg font-semibold mb-4">COS Attainment Data</h2>
       
      {/* Display the table if data is available */}
      {mergedData && mergedData.length > 0 ? (
        <div>
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border border-gray-300 px-4 py-2 text-center">Course Outcome (CO)</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Attainment Percentage</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Categorization</th>
            </tr>
          </thead>
          <tbody>
            {mergedData.map((data, index) => (
              <tr key={index}>
                <td className="border border-gray-300 px-4 py-2 text-center">{data.cosname}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">{data.averagePercentage}%</td>
                <td className="border border-gray-300 px-4 py-2 text-center">{data.categorization}</td>
              </tr>
            ))}
          </tbody>

        </table>
        <button
              onClick={handleSaveToDataStorage}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save to database Storage
        </button>
        </div>
      ) : (
        <p>No data available.</p> // Show if no data is available
      )}
      
    </div>
  );
};

export default NoCosAttainment;
