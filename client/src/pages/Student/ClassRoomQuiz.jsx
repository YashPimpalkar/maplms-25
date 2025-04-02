import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api";

const ClassRoomQuiz = ({ sid }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [data, setData] = useState([]);
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const { classroomId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


 console.log(data)
  useEffect(() => {
    if (classroomId && sid) {
      fetchQuizzes();
    }
  }, [classroomId, sid]);

  const fetchQuizzes = async () => {
    try {
      const response = await api.get(
        `/api/lmsclassroom/activities/quizzes/${classroomId}/${sid}`
      );
      setQuizzes(response.data);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  };
   console.log(data)

  const handleChange = (questionId, optionId, type) => {
    setResponses((prev) => {
      const updatedResponses = { ...prev };
      if (type === "checkbox") {
        const selectedOptions = updatedResponses[questionId] || [];
        if (selectedOptions.includes(optionId)) {
          updatedResponses[questionId] = selectedOptions.filter((id) => id !== optionId);
        } else {
          updatedResponses[questionId] = [...selectedOptions, optionId];
        }
      } else {
        updatedResponses[questionId] = [optionId]; // Store as an array for consistency
      }
      return updatedResponses;
    });
  };

  const handleSubmit = async () => {
    let totalScore = 0;
    let quizResults = [];

    quizzes.forEach((quiz) => {
      quiz.questions.forEach((question) => {
        const correctAnswers = question.correctAnswers.sort((a, b) => a - b);
        const selectedAnswers = (responses[question.questionId] || []).sort((a, b) => a - b);

        if (JSON.stringify(correctAnswers) === JSON.stringify(selectedAnswers)) {
          totalScore += question.marks;
        }

        quizResults.push({
          questionId: question.questionId,
          selectedAnswers,
          correctAnswers,
          marksAwarded: JSON.stringify(correctAnswers) === JSON.stringify(selectedAnswers) ? question.marks : 0,
        });
      });
    });

    setScore(totalScore);
    setSubmitted(true);

    console.log("Submitting Quiz Data:", {
        form_id: quizzes.map(quiz => quiz.formId),
        classroomId,
        sid,
        score: totalScore,
        responses: quizResults,
      });
    // Save the marks to the database
    try {
      await api.post("/api/lmsclassroom/activities/quizzes/submit", {
        form_id: quizzes.map(quiz => quiz.formId),
        classroomId,
        sid,
        score: totalScore,
        responses: quizResults,
      });
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {quizzes.map((quiz) => (
        <div key={quiz.formId} className="border p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">{quiz.title}</h2>
          {quiz.questions.map((question) => (
            <div key={question.questionId} className="mb-4">
              <p className="font-semibold">{question.text}</p>
              {question.options.map((option) => (
                <label key={option.optionId} className="block">
                  <input
                    type={question.type === "checkbox" ? "checkbox" : "radio"}
                    name={`question-${question.questionId}`}
                    value={option.optionId}
                    checked={(responses[question.questionId] || []).includes(option.optionId)}
                    onChange={() => handleChange(question.questionId, option.optionId, question.type)}
                    disabled={submitted}
                  />
                  {option.text}
                </label>
              ))}
            </div>
          ))}
        </div>
      ))}
      {!submitted ? (
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4 hover:bg-blue-700"
          onClick={handleSubmit}
        >
          Submit Quiz
        </button>
      ) : (
        <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg">
          <h3 className="text-lg font-bold">Your Score: {score}</h3>
        </div>
      )}
    </div>
  );
};

export default ClassRoomQuiz;
