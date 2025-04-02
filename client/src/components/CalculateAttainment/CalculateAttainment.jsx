import React, { useEffect, useState } from "react";
import TermworkAttainment from "./TermworkAttainment";
import NoCosAttainment from "./NoCosAttainment";
import TheoryAttainment from "./TheoryAttainment";
import FeedbackAttainment from "./FeedbackAttainment";
import api from "../../api";

const excludedCurriculumIds = [3, 16];
const TheoryCurriculumIds = [1, 2];
const noCurriculumIds = [18];
const feedbackId = [17];


const CalculateAttainment = ({
  data,
  transformedData,
  questions,
  userCourseId,
  selectedCurriculumId,
}) => {
  const [attainmentPercentage, setAttainmentPercentage] = useState(50);
  const [invalidStudents, setInvalidStudents] = useState([]); 
  const [flag, setFlag] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const handlePercentageChange = (e) => {
    const numericValue = Number(e.target.value);
    setAttainmentPercentage(numericValue);
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await api.get(`api/feedback/status/${userCourseId}`);
        console.log("Fetched status:", response.data); // Debugging
        setIsActive(response.data.status === 1);
      } catch (error) {
        console.error("Error fetching status:", error);
      }
    };
  
    fetchStatus();
  }, [userCourseId]);
  

  // Toggle status in database based on button value
  const handleToggle = () => {
    const newStatus = isActive ? 0 : 1; // Toggle the status

    api
      .put(`api/feedback/status/${userCourseId}`, { newStatus })
      .then(() => {
        setIsActive(newStatus); // Update state based on new status
      })
      .catch((error) => console.error("Error updating status:", error));
  };



  //   const All_Students_data = () => {
  //     // Find the matching qname in transformedData
  //     const matchingQname = transformedData.find((item) => item.qname === qname);

  //     // If selectedCurriculumId is in excludedCurriculumIds, check in questions
  //     if (excludedCurriculumIds.includes(selectedCurriculumId)) {
  //       const question = questions.find((q) => q.qname === qname);
  //       if (question) {
  //         return question.qname !== null && question.qname.toString().trim() !== '' ? 1 : 0;
  //       }
  //     }

  //     // Otherwise, check in transformedData
  //     if (matchingQname) {
  //       return data.every(item => item.qname !== null && item.qname.toString().trim() !== '') ? 1 : 0;
  //     }

  //     // If no matching qname is found, return 0
  //     return 0;
  //   };

  //  flag =All_Students_data()
 const greaterthansign = ">";
// Function to validate all students' data and return invalid students
const validateAllStudentsData = (transformedData, data, questions, selectedCurriculumId) => {
  const sourceData = excludedCurriculumIds.includes(selectedCurriculumId) ? questions : transformedData;

  const invalidEntries = [];

  // Iterate over each item in sourceData to get the qname
  for (const item of sourceData) {
    const qname = item.qname;
    // Check for any invalid student entry for the current qname
    data.forEach((student ,index) => {
       
      if (
        student[qname] === null ||
        student[qname] === undefined ||
        student[qname].toString().trim() === ""
      ) {
        // Collect the invalid student's sid and student_name
        invalidEntries.push({index:index+1, sid: student.sid, student_name: student.student_name });
      }
      index++;
    });
  }

  // Remove duplicate entries by sid
  const uniqueInvalidEntries = Array.from(
    new Map(invalidEntries.map((student) => [student.sid, student])).values()
  );

  // Return true if there are no invalid entries, false otherwise
  return uniqueInvalidEntries;
};

// Use useEffect to set the flag value based on the validity of all students' data
useEffect(() => {
  const invalidEntries = validateAllStudentsData(transformedData, data, questions, selectedCurriculumId);

  setFlag(invalidEntries.length === 0 ? 1 : 0);
  setInvalidStudents(invalidEntries); // Only update the invalid students state when needed
}, [transformedData, data, questions, selectedCurriculumId]); // Dependencies for when data changes

// Function to handle button click and display invalid students
const handleButtonClick = () => {
  if (invalidStudents.length > 0) {
    console.log("Invalid Students:", invalidStudents);
 
    alert(
      `Invalid Students:\n${invalidStudents
        .map((student) => 
          `Index: ${student.index }, SID: ${student.sid}, Name: ${student.student_name}`) // Adding 1 to the index to start from 1
        .join("\n")}`
    );
  } else {
    alert("All students have valid data!");
  }
};



  // Function to calculate the number of students who have marks greater than the attainment percentage for a given qname
  const calculateAboveThreshold = (qname) => {
    const matchingQname = transformedData.find((item) => item.qname === qname);

    const threshold =
      (attainmentPercentage / 100) * (matchingQname?.qmarks || 0);

    if (excludedCurriculumIds.includes(selectedCurriculumId)) {
      const question = questions.find((q) => q.qname === qname);

      return data.filter(
        (row) =>
          row[qname] !== null &&
          row[qname] !== undefined &&
          row[qname] !== "N" &&
          row[qname] !== "A" &&
          row[qname] >= (attainmentPercentage / 100) * (question?.qmarks || 0)
      ).length;
    }

    return data.filter(
      (row) =>
        row[qname] !== null &&
        row[qname] !== undefined &&
        row[qname] !== "N" &&
        row[qname] !== "A" &&
        row[qname] >= threshold
    ).length;
  };

  // Function to calculate the total number of students who do not have null or undefined values for a given qname
  const calculateValidEntries = (qname) => {
    return data.filter(
      (row) =>
        row[qname] !== null &&
        row[qname] !== undefined &&
        row[qname] !== "A" &&
        row[qname] !== "N"
    ).length;
  };

  // Function to calculate the percentage of students above the threshold
  const calculatePercentageAboveThreshold = (qname) => {
    const validEntries = calculateValidEntries(qname);
    if (validEntries === 0) return 0; // Avoid division by zero
    const aboveThreshold = calculateAboveThreshold(qname);
    return ((aboveThreshold * 100) / validEntries).toFixed(2); // Returns percentage as a string with 2 decimal places
  };

  const columnsData = Object.keys(data[0] || {})
    .filter(
      (key) => key !== "sid" && key !== "student_name" && key !== "stud_clg_id" && key !== "t_id"
    )
    .map((key) => {
      const matchingQname = transformedData.find((item) => item.qname === key);
      const cosname = matchingQname?.coname || [];
      const percentageAboveThreshold = calculatePercentageAboveThreshold(key);

      return {
        key,
        cosname,
        percentageAboveThreshold,
      };
    });

  const NOCOData = Object.keys(data[0] || {})
    .filter(
      (key) => key !== "sid" && key !== "student_name" && key !== "stud_clg_id" && key !== "t_id"
    )
    .map((key) => {
      const matchingQname = questions.find((item) => item.qname === key);
      const percentageAboveThreshold = calculatePercentageAboveThreshold(key);
      return {
        key,
        percentageAboveThreshold,
      };
    });

  if (noCurriculumIds.includes(selectedCurriculumId)) {
    return (
      <div className="p-4 border rounded bg-gray-50">
        <p className="text-lg font-semibold">
          No attainment for this curriculum
        </p>
      </div>
    );
  }


  
  // console.log(flag);
  return (
    <div className="">
      {flag ? (
        <div className="p-4 border rounded bg-gray-50 ">
          <h2 className="text-lg font-semibold mb-4">Calculate Attainment</h2>
          <div className="mb-4">
            <label
              htmlFor="attainmentPercentage"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Enter Attainment Percentage (%):
            </label>
            <input
              type="text"
              id="attainmentPercentage"
              value={attainmentPercentage}
              onChange={handlePercentageChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="e.g., 75"
            />
          </div>
          <p className="text-sm text-gray-600">
            Current attainment percentage:{" "}
            {attainmentPercentage || "Not entered"}
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="border border-gray-300 px-4 py-2">Type</th>
                  {Object.keys(data[0] || {})
                    .filter(
                      (key) =>
                        key !== "sid" &&
                        key !== "student_name" &&
                        key !== "stud_clg_id" &&
                        key !== "t_id"
                    )
                    .map((key) => {
                      const matchingQname = transformedData.find(
                        (item) => item.qname === key
                      );
                      return (
                        <th
                          key={key}
                          className="border border-gray-300 px-4 py-2"
                        >
                          <div>{key}</div>
                          {matchingQname?.coname?.length > 0 && (
                            <div className="text-sm text-gray-600">
                              {matchingQname.coname.join(", ")}
                            </div>
                          )}
                        </th>
                      );
                    })}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold">
                    Total Students Passed with {greaterthansign}= {attainmentPercentage}%
                  </td>
                  {Object.keys(data[0] || {})
                    .filter(
                      (key) =>
                        key !== "sid" &&
                        key !== "student_name" &&
                        key !== "stud_clg_id" &&
                        key !== "t_id"
                    )
                    .map((key) => (
                      <td
                        key={key}
                        className="border border-gray-300 px-4 py-2"
                      >
                        {calculateAboveThreshold(key)}
                      </td>
                    ))}
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold">
                    Total Students Attenmpted the Question
                  </td>
                  {Object.keys(data[0] || {})
                    .filter(
                      (key) =>
                        key !== "sid" &&
                        key !== "student_name" &&
                        key !== "stud_clg_id" &&
                        key !== "t_id"
                    )
                    .map((key) => (
                      <td
                        key={key}
                        className="border border-gray-300 px-4 py-2"
                      >
                        {calculateValidEntries(key)}
                      </td>
                    ))}
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold">
                    CO Attainment
                  </td>
                  {Object.keys(data[0] || {})
                    .filter(
                      (key) =>
                        key !== "sid" &&
                        key !== "student_name" &&
                        key !== "stud_clg_id" &&
                        key !== "t_id"
                    )
                    .map((key) => (
                      <td
                        key={key}
                        className="border border-gray-300 px-4 py-2"
                      >
                        {calculatePercentageAboveThreshold(key)}%
                      </td>
                    ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Conditional rendering of components based on the selectedCurriculumId */}
          {TheoryCurriculumIds.includes(selectedCurriculumId) ? (
            <TheoryAttainment
              columnsData={columnsData}
              userCourseId={userCourseId}
              selectedCurriculumId={selectedCurriculumId}
            />
          ) : excludedCurriculumIds.includes(selectedCurriculumId) ? (
            <NoCosAttainment
              NOCOData={NOCOData}
              userCourseId={userCourseId}
              selectedCurriculumId={selectedCurriculumId}
            />
          )  : (
            <TermworkAttainment
              userCourseId={userCourseId}
              selectedCurriculumId={selectedCurriculumId}
              columnsData={columnsData}
              attainmentPercentage={attainmentPercentage}
            />
          )}
          {/*  */}
        </div>
      ) :  feedbackId.includes(selectedCurriculumId) ? (
        <>
          <div className="flex justify-center items-center space-x-4 mt-4">
      {/* Current Status Text */}
      <span className={`font-semibold ${isActive ? "text-green-600" : "text-gray-600"}`}>
        Status: {isActive ? "Active" : "Not Active"}
      </span>

      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
          isActive ? "bg-green-500 text-white" : "bg-gray-300 text-gray-700"
        }`}
      >
        {isActive ? "Active" : "Not Active"}
      </button>
    </div>
        <h2 className="text-lg font-semibold mb-4">Calculate Attainment</h2>
        <div className="mb-4">
          <label
            htmlFor="attainmentPercentage"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Enter Attainment Percentage (%):
          </label>
          <input
            type="text"
            id="attainmentPercentage"
            value={attainmentPercentage}
            onChange={handlePercentageChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200"
            placeholder="e.g., 75"
          />
        </div>
        <p className="text-sm text-gray-600">
          Current attainment percentage:{" "}
          {attainmentPercentage || "Not entered"}
        </p>
        <FeedbackAttainment
          columnsData={columnsData}
          userCourseId={userCourseId}
          selectedCurriculumId={selectedCurriculumId}
        />
        </>
      ): (
        <>
      <button onClick={handleButtonClick} className="check-invalid-btn">Check Invalid Students</button>
        <div className="flex justify-center space-x-4 mb-4">
          Please fill in all students' data.
        </div>
        </>
      )}
    </div>
  );
};

export default CalculateAttainment;
