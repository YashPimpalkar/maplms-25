import React, { useEffect, useState } from "react";
import api from "../../api";
const excludedCurriculumIds = [3, 16, 18];
const QuestionnaireForm = ({uid, userCourseId, selectedCurriculumId }) => {
  const [numQuestions, setNumQuestions] = useState(0);
  const [maxMarksAll, setMaxMarksAll] = useState(0);
  const [questionsData, setQuestionsData] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [cosData, setCosData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchCosData = async () => {
      try {
        const response = await api.post(`api/cos/${userCourseId}`);

        setCosData(response.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCosData();
  }, [userCourseId]);
  console.log(cosData);
  // Reset form and handle special cases for curriculum ID
  useEffect(() => {
    if (excludedCurriculumIds.includes(selectedCurriculumId)) {
      setNumQuestions(1);
      setQuestionsData([
        {
          questionName: "",
          numCos: 0,
          cos: [],
          maxMarks: "",
        },
      ]);
    } else {
      setNumQuestions(0);
      setQuestionsData([]);
    }
  }, [selectedCurriculumId]);

  // Validate form whenever questionsData changes
  useEffect(() => {
    const isValid = questionsData.every((question) => {
      if (excludedCurriculumIds.includes(selectedCurriculumId)) {
        return question.questionName && question.maxMarks > 0;
      } else {
        return (
          question.maxMarksAll,
          question.questionName &&
            question.numCos > 0 &&
            question.cos.length === question.numCos &&
            question.cos.every((co) => co) &&
            question.maxMarks > 0
        );
      }
    });
    setIsFormValid(isValid && maxMarksAll > 0 && numQuestions > 0); // Include maxMarksAll and numQuestions validation
  }, [questionsData, maxMarksAll, selectedCurriculumId, numQuestions]);

  const handleQuestionDataChange = (index, field, value) => {
    const updatedQuestions = [...questionsData];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]:
        field === "numCos" || field === "maxMarks" ? Number(value) : value,
      cos: updatedQuestions[index]?.cos || [],
    };
    setQuestionsData(updatedQuestions);
  };

  const handleCOChange = (qIndex, coIndex, value) => {
    const updatedQuestions = [...questionsData];
    if (!updatedQuestions[qIndex].cos) updatedQuestions[qIndex].cos = [];
    updatedQuestions[qIndex].cos[coIndex] = value;
    setQuestionsData(updatedQuestions);
  };
  const handleSubmit = async () => {
    const submissionData = {
      t_id: uid,
      userCourseId: userCourseId,
      curriculumId: selectedCurriculumId,
      noOfQuestions: questionsData.length,
      maxMarksAll, // I
      questions: questionsData.map((q) => ({
        questionName: q.questionName,
        maxMarks: q.maxMarks,
        ...(!excludedCurriculumIds.includes(selectedCurriculumId) && {
          numCos: q.numCos,
          cos: q.cos,
        }),
      })),
    };

    try {
      const response = await api.post("/api/termwork/upload-questions", {
        submissionData,
      });

      // If the response indicates that data already exists, show the alert
      if (
        response.status === 400 &&
        response.data.message ===
          "Data already exists for the given userCourseId and curriculumId"
      ) {
        alert(
          "Data already present for the given userCourseId and curriculumId"
        );
        return; // Stop further execution if data already exists
      }

      console.log("Submission successful:", response);
      alert("Data submitted successfully!");
    } catch (error) {
      // Check if it's an AxiosError with a 400 status
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data.message ===
          "Data already exists for the given userCourseId and curriculumId"
      ) {
        alert(
          "Data already present for the given userCourseId and curriculumId"
        );
      } else {
        console.error("Error during submission:", error);
        alert("An error occurred while submitting the data.");
      }
    }
  };

  return (
    <div className="mt-6 p-4">
      <label className="block text-gray-700 font-medium mb-2">
        Number of Questions{" "}
        {excludedCurriculumIds.includes(selectedCurriculumId)
          ? "(Fixed to 1)"
          : "(Max 20)"}
        :
      </label>
      <input
        type="text"
        className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
        value={numQuestions}
        onChange={(e) => {
          const count = Math.min(parseInt(e.target.value, 10) || 0, 20);
          setNumQuestions(count);
          setQuestionsData(
            Array.from({ length: count }, () => ({
              questionName: "",
              numCos: 0,
              cos: [],
              maxMarks: "",
            }))
          );
        }}
        disabled={excludedCurriculumIds.includes(selectedCurriculumId)}
      />
      <label className="block text-gray-700 font-medium mb-2">
        Max Marks for All Questions:
      </label>
      <input
        type="text"
        className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
        value={maxMarksAll}
        onChange={(e) => {
          const maxMarks = Number(e.target.value) || 0;
          setMaxMarksAll(maxMarks);
        }}
      />

      {questionsData.length > 0 && maxMarksAll > 0 && (
        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Index</th>
                <th className="border border-gray-300 px-4 py-2">
                  Question Name
                </th>
                {!excludedCurriculumIds.includes(selectedCurriculumId) && (
                  <>
                    <th className="border border-gray-300 px-4 py-2">
                      How Many COs?
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      CO Names
                    </th>
                  </>
                )}
                <th className="border border-gray-300 px-4 py-2">Max Marks</th>
              </tr>
            </thead>
            <tbody>
              {questionsData.map((question, qIndex) => (
                <tr key={qIndex} className="bg-white hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {qIndex + 1}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md"
                      value={question.questionName.toUpperCase()}
                      onChange={(e) =>
                        handleQuestionDataChange(
                          qIndex,
                          "questionName",
                          e.target.value.toUpperCase()
                        )
                      }
                    />
                  </td>
                  {!excludedCurriculumIds.includes(selectedCurriculumId) && (
                    <>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          type="text"
                          className="w-full px-2 py-1 border border-gray-300 rounded-md"
                          value={question.numCos.toString()}
                          onChange={(e) => {
                            const numCos = Math.min(
                              Number(e.target.value) || 0,
                              10
                            );
                            handleQuestionDataChange(qIndex, "numCos", numCos);
                          }}
                        />
                      </td>
                      {/* <td className="border border-gray-300 px-4 py-2">
                        <div className="flex flex-wrap gap-2">
                          {Array.from({ length: question.numCos }, (_, coIndex) => (
                            <input
                              key={coIndex}
                              type="text"
                              placeholder={`CO ${coIndex + 1}`}
                              className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                              value={question.cos[coIndex] || ""}
                              onChange={(e) =>
                                handleCOChange(qIndex, coIndex, e.target.value.toUpperCase())
                              }
                            />
                          ))}
                        </div>
                      </td> */}
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="flex flex-wrap gap-2">
                          {Array.from(
                            { length: question.numCos },
                            (_, coIndex) => (
                              <select
                                key={coIndex}
                                className="w-28 px-2 py-1 border border-gray-300 rounded-md"
                                value={question.cos[coIndex] || ""}
                                onChange={(e) =>
                                  handleCOChange(
                                    qIndex,
                                    coIndex,
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">Select CO</option>
                                {cosData.map((co) => (
                                  <option key={co.idcos} value={co.co_name}>
                                    {co.co_name}
                                  </option>
                                ))}
                              </select>
                            )
                          )}
                        </div>
                      </td>
                    </>
                  )}
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md"
                      value={question.maxMarks?.toString()}
                      onChange={(e) => {
                        const maxMarks = Number(e.target.value) || 0;
                        handleQuestionDataChange(qIndex, "maxMarks", maxMarks);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isFormValid && numQuestions > 0 && (
        <button
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          onClick={handleSubmit}
        >
          Submit
        </button>
      )}
    </div>
  );
};

export default QuestionnaireForm;
