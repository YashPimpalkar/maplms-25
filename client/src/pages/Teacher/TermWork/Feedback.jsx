import React, { useEffect, useState } from "react";
import CourseSelector from "../../../components/CourseSelector/CourseSelector";
import api from "../../../api";
import CalculateAttainment from "../../../components/CalculateAttainment/CalculateAttainment";

const Feedback = ({ uid }) => {
  const [userCourseId, setUserCourseId] = useState(null);
  const [numQuestions, setNumQuestions] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [question, setQuestion] = useState([]);
  const [marksData, setMarksData] = useState([]);
  const [cosdata, SetCosData] = useState([]);
  const [error, setError] = useState(null);
  const selectedCurriculumId = 17;
  const [cosData, setCosData] = useState([]);
  const [loading, setLoading] = useState(true);

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

  console.log(marksData);
  useEffect(() => {
    const fetchTermworkLabels = async () => {
      try {
        const response = await api.get("/api/termwork/get-student-marks", {
          params: {
            userCourseId,
            selectedCurriculumId,
          },
        });
        const response2 = await api.get("/api/termwork/get-questions-cos", {
          params: { userCourseId, selectedCurriculumId },
        });
        const response3 = await api.get(
          "/api/termwork/get-questions-withoutcos",
          {
            params: { userCourseId, selectedCurriculumId },
          }
        );

        if (
          response.data &&
          Array.isArray(response.data) &&
          response.data.length > 0
        ) {
          if (
            response.data[0].Message ==
            "No data found for the specified parameters."
          ) {
            setMarksData([]);
            setError("No data found for the specified parameters.");
          } else {
            setMarksData(response.data);
            setError(null);
          }
        } else {
          setMarksData([]); // Ensure no table is displayed
          setError("No data found.");
        }

        if (response2.data && Array.isArray(response2.data)) {
          SetCosData(response2.data);
        } else {
          SetCosData([]);
          console.warn("No Questions and COs data found.");
        }

        if (response3.data && Array.isArray(response3.data)) {
          setQuestions(response3.data);
        } else {
          console.warn("No questions without COs data found.");
          setQuestions([]);
        }
      } catch (error) {
        console.error("Error fetching termwork labels:", error);
        setMarksData([]); // Ensure no table is displayed
      }
    };

    if (userCourseId) {
      fetchTermworkLabels();
    } else {
      setMarksData([]); // Ensure no table is displayed
      setQuestions([]);
    }
  }, [userCourseId]);

  const transformedData = Object.values(
    cosdata.reduce((acc, item) => {
      const { idquestion_main, qname, qmarks, maxmarks, coname } = item;
      if (!acc[idquestion_main]) {
        acc[idquestion_main] = {
          idquestion_main,
          qname,
          qmarks,
          maxmarks,
          coname: [],
        };
      }
      if (!acc[idquestion_main].coname.includes(coname)) {
        acc[idquestion_main].coname.push(coname);
      }
      return acc;
    }, {})
  );

  const handleInputChange = (index, field, value) => {
    const updatedQuestions = [...questions];
  
    if (field === "coCount") {
      let count = parseInt(value, 10) || 0;
      count = Math.max(0, Math.min(10, count)); // Restrict between 0 and 10
  
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        coCount: count, // Set the restricted value
        coNames: Array.from(
          { length: count },
          (_, i) => updatedQuestions[index].coNames[i] || ""
        ),
      };
    } else {
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        [field]: value,
      };
    }
  
    setQuestions(updatedQuestions);
  };
  
  const handleCoNameChange = (qIndex, coIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].coNames[coIndex] = value;
    setQuestions(updatedQuestions);
  };

  const validateNumberInput = (value, min, max) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < min) return min;
    if (num > max) return max;
    return num;
  };

  const isSubmitEnabled = () => {
    if (!userCourseId || numQuestions === 0) return false;
    return questions.every(
      (q) =>
        q.questionName.trim() &&
        q.coCount > 0 &&
        q.coNames.every((coName) => coName.trim())
    );
  };

  const handleSubmit = async () => {
    const formattedQuestions = questions.map((q) => ({
      questionName: q.questionName,
      coCount: q.coCount,
      coNames: q.coNames,
    }));

    const submissionData = {
      userCourseId,
      curriculumId: 17,
      questions: formattedQuestions,
    };

    console.log(submissionData);
    try {
      const response = await api.post("/api/feedback/upload", {
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

  console.log(marksData);
  return (
    <div className="left-0 z-45 w-full mt-8">
      <h1 className="text-3xl md:text-4xl lg:text-5xl mb-6 text-blue-700 text-center font-extrabold flex justify-center mt-10">
        Course Exit Survey
      </h1>
      <div className="flex justify-center mb-6">
        <div className="w-full max-w-lg md:max-w-2xl lg:max-w-3xl">
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
            <CourseSelector uid={uid} onUserCourseIdChange={setUserCourseId} />
          </div>
        </div>
      </div>

      {userCourseId && marksData.length > 0 ? (
        <CalculateAttainment
          data={marksData}
          transformedData={transformedData}
          selectedCurriculumId={selectedCurriculumId}
          userCourseId={userCourseId}
          questions={questions}
        />
      ) : userCourseId ? (
        <>
          <div className="mt-4">
            <label className="block font-medium mb-2">
              Number of Questions:
            </label>
            <input
              type="text"
              value={numQuestions}
              onChange={(e) => {
                const count = validateNumberInput(e.target.value, 0, 20);
                setNumQuestions(count);
                setQuestions(
                  Array.from({ length: count }, () => ({
                    questionName: "",
                    coCount: 0,
                    coNames: [],
                  }))
                );
              }}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full"
              placeholder="Enter a number (0-20)"
            />
          </div>

          {numQuestions > 0 && (
            <table className="w-full mt-6 border border-collapse border-gray-300">
              <thead>
              <tr>
          <th className="border px-4 py-3 w-16 text-center">Index</th>
          <th className="border px-4 py-3 w-80 text-left">Question Name</th>
          <th className="border px-4 py-3 w-32 text-center">CO Count</th>
          <th className="border px-4 py-3 w-60 text-center">CO Names</th>
        </tr>
              </thead>
              <tbody>
                {questions.map((q, index) => (
                  <tr key={index}>
                    <td className="border px-4 py-2 text-center">
                      {index + 1}
                    </td>
                    <td className="border px-4 py-2">
                      <input
                        type="text"
                        value={q.questionName}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "questionName",
                            e.target.value
                          )
                        }
                        className="border border-gray-300 rounded-lg px-2 py-1 w-full"
                        placeholder={`Question ${index + 1}`}
                      />
                    </td>
                    <td className="border px-4 py-2 w-28 sm:w-32 md:w-40 lg:w-48">
                      <input
                        type="text"
                        value={q.coCount}
                        onChange={(e) =>
                          handleInputChange(index, "coCount", e.target.value)
                        }
                        className="border border-gray-300 rounded-lg px-2 py-1 w-full"
                        placeholder="Enter CO count"
                        min="0"
                        max="10"
                      />
                    </td>
                    {/* <td className="border px-4 py-2">
                      {q.coNames.map((coName, coIndex) => (
                        <input
                          key={coIndex}
                          type="text"
                          value={coName.toUpperCase()}
                          onChange={(e) =>
                            handleCoNameChange(index, coIndex, e.target.value)
                          }
                          className="w-20 px-2 py-1 border border-gray-300 rounded-lg mr-2"
                          placeholder={`CO${coIndex + 1}`}
                        />
                      ))}
                    </td> */}
                    <td className="border px-4 py-2">
                      {q.coNames.map((coName, coIndex) => (
                        <select
                          key={coIndex}
                          value={coName}
                          onChange={(e) =>
                            handleCoNameChange(index, coIndex, e.target.value)
                          }
                          className="w-28 px-2 py-1 border border-gray-300 rounded-lg mr-2"
                        >
                          <option value="">Select CO</option>
                          {cosData.map((co) => (
                            <option key={co.idcos} value={co.co_name}>
                              {co.co_name}
                            </option>
                          ))}
                        </select>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {numQuestions > 0 && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleSubmit}
                disabled={!isSubmitEnabled()}
                className={`px-6 py-2 rounded-lg ${
                  isSubmitEnabled()
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Submit
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <h1>No usercourse selected</h1>
        </>
      )}
    </div>
  );
};

export default Feedback;
