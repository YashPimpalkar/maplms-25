import React, { useState } from "react";

const MarksTable = ({
  transformedData,
  cosdata,
  data,
  currentPage,
  itemsPerPage,
  onEdit,
  onSaveMarks,
  uid
}) => {
  console.log(cosdata);
  const [editRowId, setEditRowId] = useState(null);
  const [editableMarks, setEditableMarks] = useState({});
 

  const handleEdit = (rowId) => {
    setEditRowId(rowId);
    const currentRow = data.find((row) => row.sid === rowId);
    setEditableMarks(currentRow);
  };

  const handleCancel = () => {
    setEditRowId(null);
    setEditableMarks({});
  };
 console.log(transformedData);
  const handleSave = () => {
    const marksWithQuestionId = Object.keys(editableMarks).reduce((acc, key) => {
      const questionData = transformedData.find((item) => item.qname === key);
      const value = editableMarks[key];
  
      // Only include values that are valid and not blank
      if (
        questionData &&
        value !== undefined &&
        value !== null &&
        value.trim() !== "" &&
        (value === "N" || value === "A" || !isNaN(value))
      ) {
        acc.push({
          key,
          marks: value,
          idquestion_main: questionData.idquestion_main,
          t_id:uid
        });
      }
      return acc;
    }, []);
  
    if (marksWithQuestionId.length > 0) {
      onSaveMarks({ marksWithQuestionId, sid: editRowId,t_id:uid });
      setEditRowId(null);
      setEditableMarks({});
    } else {
      alert("Please ensure all fields are filled correctly before saving.");
    }
  };
  

  const handleMarksChange = (key, value, qmarks) => {
    // Trim whitespace and normalize input
    const trimmedValue = value.trim();
  
    // Check if the input is valid and not blank
    const isNotBlank = trimmedValue !== "";
    const isNumeric = !isNaN(trimmedValue) && Number(trimmedValue) >= 0 && Number(trimmedValue) <= qmarks;
    const isValidString = trimmedValue === "N" || trimmedValue === "A";
  
    if (isNotBlank && (isNumeric || isValidString)) {
      setEditableMarks((prev) => ({ ...prev, [key]: trimmedValue }));
    }
    else{
      alert("Please ensure all fields are filled correctly before saving.");
    }
  };
  

  const calculateTotal = (row) => {
    const marks = Object.keys(row)
      .filter((key) =>
        transformedData.some((item) => item.qname === key)
      )
      .map((key) => {
        const questionData = transformedData.find((item) => item.qname === key);
        let mark = row[key];
  
        // If mark is "N" or "A", treat it as 0
        if (mark === "N" || mark === "A") {
          mark = 0;
        } else {
          mark = parseFloat(mark); // Ensure the mark is a number
        }
  
        return {
          key,
          marks: mark,
          qmarks: questionData?.qmarks,
        };
      });
  
    // Filter marks where qmarks === 5
    const filteredMarks = marks.filter((item) => item.qmarks === 5);
  
    // If there are 4 or more qmarks === 5, take the top 3 highest values
    let top3Marks = [];
    if (filteredMarks.length >= 4) {
      top3Marks = filteredMarks
        .sort((a, b) => b.marks - a.marks)  // Sorting by marks (highest to lowest)
        .slice(0, 3)                       // Take top 3
        .map((item) => item.marks);         // Get only the marks value
    } else {
      // If there are less than 4, include all marks with qmarks === 5
      top3Marks = filteredMarks.map((item) => item.marks);
    }
  
    // Handle the other marks (qmarks !== 5)
    const otherMarks = marks
      .filter((item) => item.qmarks !== 5)
      .map((item) => item.marks);  // Use the marks for other questions
  
    // Combine the top 3 (or less) marks with other marks, then sum them
    const totalMarks = [...top3Marks, ...otherMarks].reduce((sum, mark) => sum + mark, 0);
  
    return totalMarks;
  };
  
  
  
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="border border-gray-300 px-4 py-2">Index</th>
            <th className="border border-gray-300 px-4 py-2">Student Name</th>
            <th className="border border-gray-300 px-4 py-2">
              Student College ID
            </th>
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
                  <th key={key} className="border border-gray-300 px-4 py-2">
                    <div>{key}</div>
                    {matchingQname?.coname?.length > 0 && (
                      <div className="text-sm text-gray-600">
                        {matchingQname.coname.join(", ")}
                      </div>
                    )}
                  </th>
                );
              })}
               <th className="border border-gray-300 px-4 py-2">Total</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={row.sid}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              <td className="border border-gray-300 px-4 py-2">
                {(currentPage - 1) * itemsPerPage + index + 1}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {row.student_name}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {row.stud_clg_id}
              </td>
              {Object.keys(row)
                .filter(
                  (key) =>
                    key !== "sid" &&
                    key !== "student_name" &&
                    key !== "stud_clg_id" && 
                    key !== "t_id"
                )
                .map((key) => {
                  const qmarks = transformedData.find(
                    (item) => item.qname === key
                  )?.qmarks;
                  return (
                    <td key={key} className="border border-gray-300 px-4 py-2">
                      {editRowId === row.sid ? (
                        <input
                          type="text"
                          value={editableMarks[key] ?? ""}
                          onChange={(e) =>
                            handleMarksChange(key, (e.target.value).toUpperCase(), qmarks)
                          }
                          className="w-16 border border-gray-300 rounded"
                        />
                      ) : (
                        row[key]
                      )}
                    </td>
                  );
                })}
                 <td className="border border-gray-300 px-4 py-2">
                {calculateTotal(row)}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {editRowId === row.sid ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="text-white bg-green-500 hover:bg-green-600 px-4 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="ml-2 text-white bg-red-500 hover:bg-red-600 px-4 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleEdit(row.sid)}
                    className="text-white bg-blue-500 hover:bg-blue-600 px-4 py-1 rounded"
                  >
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MarksTable;
