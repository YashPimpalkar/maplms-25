import React, { useEffect, useState } from "react";
import { FaPlus, FaTrash, FaSave } from "react-icons/fa";
import axios from "axios";
import { useParams } from "react-router-dom";
import api from "../../../../api";

const Quiz = ({ uid }) => {
  const [formTitle, setFormTitle] = useState("Untitled Form");
  const [questions, setQuestions] = useState([]);
  const { classroomId } = useParams();
  const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


  
    useEffect(() => {
      if (!classroomId) return; // Prevent API call if no classroomId
  
      const fetchQuizStudentDetails = async () => {
          try {
              const response = await api.get(`/api/lmsclassroom/activities/quiz-student-details/${classroomId}`);
              setData(response.data);
              setLoading(false);
          } catch (err) {
              setError(err.message);
              setLoading(false);
          }
      };
  
      fetchQuizStudentDetails();
  }, [classroomId]);
  const addQuestion = (type) => {
    setQuestions([
      ...questions,
      {
        id: Date.now(),
        text: "",
        type,
        options:
          type === "mcq"
            ? ["", "", "", ""]
            : type === "checkbox"
            ? ["", ""]
            : ["Yes", "No"],
        correctAnswers: [],
        marks: 1,
      },
    ]);
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleChange = (id, key, value) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [key]: value } : q))
    );
  };

  const handleOptionChange = (id, index, value) => {
    setQuestions(
      questions.map((q) =>
        q.id === id
          ? { ...q, options: q.options.map((opt, i) => (i === index ? value : opt)) }
          : q
      )
    );
  };

  const handleCorrectAnswerChange = (id, optionIndex) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === id) {
          let updatedCorrectAnswers;
          if (q.type === "mcq" || q.type === "yesno") {
            updatedCorrectAnswers = [optionIndex];
          } else if (q.type === "checkbox") {
            updatedCorrectAnswers = q.correctAnswers.includes(optionIndex)
              ? q.correctAnswers.filter((ans) => ans !== optionIndex)
              : [...q.correctAnswers, optionIndex];
          }
          return { ...q, correctAnswers: updatedCorrectAnswers };
        }
        return q;
      })
    );
  };

  const addOption = (id) => {
    setQuestions(
      questions.map((q) =>
        q.id === id && q.options.length < 5
          ? { ...q, options: [...q.options, ""] }
          : q
      )
    );
  };

  const removeOption = (id, index) => {
    setQuestions(
      questions.map((q) =>
        q.id === id && q.options.length > 2
          ? { ...q, options: q.options.filter((_, i) => i !== index) }
          : q
      )
    );
  };

  const saveForm = async () => {
    console.log("Saving form:", { title: formTitle,uid,classroomId,questions });
    try {
      await api.post("api/lmsclassroom/activities/quiz", {
        title: formTitle,
        uid,
        classroomId,
        questions,
      });
      alert("Form saved successfully!");
    } catch (error) {
      console.error("Error saving form:", error);
    }
  };
console.log(data)
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-4">Quiz Student Details (Classroom {classroomId})</h2>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 shadow-md">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border p-2">ID</th>
                            <th className="border p-2">Form ID</th>
                            <th className="border p-2">Title</th>
                            <th className="border p-2">Student Name</th>
                            <th className="border p-2">College ID</th>
                            <th className="border p-2">Marks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? (
                            data.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-100">
                                    <td className="border p-2 text-center">{item.id}</td>
                                    <td className="border p-2 text-center">{item.form_id}</td>
                                    <td className="border p-2">{item.title}</td>
                                    <td className="border p-2">{item.student_name}</td>
                                    <td className="border p-2 text-center">{item.stud_clg_id}</td>
                                    <td className="border p-2 text-center">{item.marks}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center p-4">No data found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
      <input
        type="text"
        value={formTitle}
        onChange={(e) => setFormTitle(e.target.value)}
        className="text-2xl font-bold w-full border-b p-2 focus:outline-none"
        placeholder="Form Title"
      />
      <div className="mt-4">
        {questions.map((q) => (
          <div key={q.id} className="mb-4 p-3 border rounded">
            <input
              type="text"
              value={q.text}
              onChange={(e) => handleChange(q.id, "text", e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Question"
            />
            {q.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 mt-2">
                {q.type === "mcq" || q.type === "yesno" ? (
                  <input
                    type="radio"
                    name={`mcq-${q.id}`}
                    checked={q.correctAnswers.includes(index)}
                    onChange={() => handleCorrectAnswerChange(q.id, index)}
                  />
                ) : (
                  <input
                    type="checkbox"
                    checked={q.correctAnswers.includes(index)}
                    onChange={() => handleCorrectAnswerChange(q.id, index)}
                  />
                )}
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(q.id, index, e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder={`Option ${index + 1}`}
                />
                {q.type === "checkbox" && q.options.length > 2 && (
                  <button
                    onClick={() => removeOption(q.id, index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
            {q.type === "checkbox" && q.options.length < 5 && (
              <button
                onClick={() => addOption(q.id)}
                className="mt-2 px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Add Option
              </button>
            )}
            <input
              type="number"
              value={q.marks}
              onChange={(e) => handleChange(q.id, "marks", e.target.value)}
              className="mt-2 p-2 border rounded w-20"
              placeholder="Marks"
            />
            <button
              onClick={() => removeQuestion(q.id)}
              className="mt-2 text-red-500 hover:text-red-700"
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => addQuestion("mcq")}
        className="flex items-center mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        <FaPlus className="mr-2" /> Add MCQ
      </button>
      <button
        onClick={() => addQuestion("checkbox")}
        className="flex items-center mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        <FaPlus className="mr-2" /> Add Checkbox Question
      </button>
      <button
        onClick={() => addQuestion("yesno")}
        className="flex items-center mt-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
      >
        <FaPlus className="mr-2" /> Add Yes/No Question
      </button>
      <button
        onClick={saveForm}
        className="flex items-center mt-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
      >
        <FaSave className="mr-2" /> Save Form
      </button>
    </div>
  );
};

export default Quiz;
