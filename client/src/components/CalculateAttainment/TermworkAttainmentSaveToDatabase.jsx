import React, { useState } from "react";
import api from "../../api";
import LoadingButton from "../Loading/Loading";

const TermworkAttainmentSaveToDatabase = ({
  termworkCurriculum,
  userCourseId,
}) => {
  const [uploading, setUploading] = useState(false);
  // Check if all curricula have corresponding data in localStorage
  const termworkData = termworkCurriculum.map((curriculum) => {
    const attainmentData = JSON.parse(
      localStorage.getItem(`${curriculum.idcurriculum}_termworkAttainmentData`)
    );
    return {
      ...curriculum,
      attainmentData: attainmentData?.columnsData || [],
      attainmentPercentage: attainmentData?.attainmentPercentage || null,
      userCourseId: attainmentData?.userCourseId,
    };
  });

  const missingData = termworkData.some(
    (curriculum) =>
      !curriculum.attainmentData.length ||
      curriculum.userCourseId !== userCourseId
  );

  if (missingData) {
    return (
      <div className="p-4 bg-white border rounded shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Termwork Attainment Data</h2>
        <p className="text-red-600 font-semibold">
          Please upload all curriculum data to proceed.
        </p>
      </div>
    );
  }

  // Check for attainment percentage mismatch
  const uniquePercentages = [
    ...new Set(termworkData.map((data) => data.attainmentPercentage)),
  ];
  const isMismatch = uniquePercentages.length > 1;

  // Merge and calculate distinct CO names and their average attainment percentage
  const cosnamePercentageMap = {};
  termworkData.forEach((curriculum) => {
    curriculum.attainmentData.forEach((item) => {
      item.cosname.forEach((co) => {
        if (!cosnamePercentageMap[co]) {
          cosnamePercentageMap[co] = { totalPercentage: 0, count: 0 };
        }
        cosnamePercentageMap[co].totalPercentage += parseFloat(
          item.percentageAboveThreshold
        );
        cosnamePercentageMap[co].count += 1;
      });
    });
  });

  const distinctCosnames = Object.keys(cosnamePercentageMap).map((cos) => {
    const { totalPercentage, count } = cosnamePercentageMap[cos];
    const averagePercentage = (totalPercentage / count).toFixed(2);
    let categorization;
    if (averagePercentage < 40) {
      categorization = 0;
    } else if (averagePercentage <= 60) {
      categorization = 1;
    } else if (averagePercentage <= 70) {
      categorization = 2;
    } else {
      categorization = 3;
    }

    return {
      cosname: cos,
      averagePercentage,
      categorization,
    };
  });

  const handleSaveToDataStorage = async () => {
    setUploading(true);
    try {
      const response = await api.post("/api/attainment/update", {
        userCourseId,
        selectedCurriculumId: 4,
        attainmentData: distinctCosnames,
      });
      if (response.status === 200) {
        alert("Data saved successfully!");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to save data. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-4">
      <div className="p-4 border rounded bg-gray-50 ">
        <h2 className="text-lg font-semibold mb-4">Termwork Attainment Data</h2>
        {uploading ? (
          <div className="flex justify-center space-x-4 mb-4" >
          <LoadingButton />
        </div>
        ) : isMismatch ? (
          <p className="text-red-600 font-semibold">
            Mismatch in attainment percentages across curricula. Please review
            the data.
          </p>
        ) : (
          <div>
            <h3 className="text-md font-bold mb-4">
              Attainment Percentage: {uniquePercentages[0]}%
            </h3>
            <div>
              <h3 className="text-lg font-semibold">Theory Attainment</h3>
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="border border-gray-300 px-4 py-2">
                      Course Outcome (CO)
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      Average Percentage Above Threshold
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      Categorization
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {distinctCosnames.map((cos, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-2">
                        {cos.cosname}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {cos.averagePercentage}%
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {cos.categorization}
                      </td>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default TermworkAttainmentSaveToDatabase;
