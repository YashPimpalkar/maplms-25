import React from 'react'
const excludedCurriculumIds = [1,2,3,18,16];
const TermworkAttainment = ({ columnsData, userCourseId,selectedCurriculumId,attainmentPercentage,FilteredCurriculum}) => {
    const cosnamePercentageMap = {};
    console.log(FilteredCurriculum)
    columnsData.forEach((col) => {
      col.cosname.forEach((cos) => {
        if (!cosnamePercentageMap[cos]) {
          cosnamePercentageMap[cos] = { totalPercentage: 0, count: 0 };
        }
        cosnamePercentageMap[cos].totalPercentage += parseFloat(col.percentageAboveThreshold);
        cosnamePercentageMap[cos].count += 1;
      });
    });
  
    // Step 2: Calculate the average percentage for each cosname
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
        categorization,// Round to 2 decimal places
      };
    });


    const handleSaveToLocalStorage = () => {
        const dataToSave = {
          columnsData,
          userCourseId,
          selectedCurriculumId,
          attainmentPercentage,
        };
    
        localStorage.setItem(`${selectedCurriculumId}_termworkAttainmentData`, JSON.stringify(dataToSave));
        alert('Data saved to local storage!');
      };

 
  
    return (
      <div>
        <h3 className="text-lg font-semibold">Theory Attainment</h3>
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border border-gray-300 px-4 py-2 text-center">Course Outcome (CO)</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Average Percentage Above Threshold</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Categorization</th>
            </tr>
          </thead>
          <tbody>
            {distinctCosnames.map((cos, index) => (
              <tr key={index}>
                <td className="border border-gray-300 px-4 py-2 text-center">{cos.cosname}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">{cos.averagePercentage}%</td>
                <td className="border border-gray-300 px-4 py-2 text-center">{cos.categorization}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
        onClick={handleSaveToLocalStorage}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Save to Local Storage
      </button>
      </div>
    );
  };

export default TermworkAttainment