import React, { useEffect, useState } from "react";
import api from "../../api";

const SimpleMarksTable = ({ data,questions, currentPage, itemsPerPage, onSaveMarks,uid }) => {

  const [editRowId, setEditRowId] = useState(null);
  const [editableMarks, setEditableMarks] = useState({});
  console.log(questions)
  // Fetch questions without COs
  console.log(questions)

  const handleEdit = (rowId) => {
    setEditRowId(rowId);
    const currentRow = data.find((row) => row.sid === rowId);
    setEditableMarks(currentRow);
  };

  const handleCancel = () => {
    setEditRowId(null);
    setEditableMarks({});
  };

  const handleSave = () => {
    const marksWithQuestionId = Object.keys(editableMarks).reduce(
      (acc, key) => {
        const questionData = questions.find((item) => item.qname === key);
        const value = editableMarks[key];

         if (
        questionData &&
        value !== undefined &&
        value !== null &&
        value.trim() !== "" &&
        (value === "N" || value === "A" || !isNaN(value))
      ) {
          acc.push({
            key,
            marks: editableMarks[key],
            idquestion_main: questionData.idquestion_main,
            t_id:uid
          });
        }
        return acc;
      },
      []
    );

    if (marksWithQuestionId.length > 0) {
      onSaveMarks({ marksWithQuestionId, sid: editRowId ,t_id:uid});
      setEditRowId(null);
      setEditableMarks({});
    } else {
      alert("Please ensure all fields are filled correctly before saving.");
    }
  };

  // const handleMarksChange = (key, value, maxmarks) => {
  //   const numericValue = value === "" ? null : Number(value);
  //   if (
  //     numericValue === null ||
  //     (numericValue >= 0 && numericValue <= maxmarks)
  //   ) {
  //     setEditableMarks((prev) => ({ ...prev, [key]: numericValue }));
  //   }
  // };
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
              .map((key) => (
                <th key={key} className="border border-gray-300 px-4 py-2">
                  {key}
                </th>
              ))}
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
                    const qmarks = questions.find(
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

export default SimpleMarksTable;
