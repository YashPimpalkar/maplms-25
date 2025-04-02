import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api";
import { FaSpinner, FaExclamationTriangle, FaCheckCircle, FaArrowLeft, FaClipboardList } from "react-icons/fa";

const ViewFeedback = ({ sid }) => {
  const { usercourseid } = useParams();
  const [feedbackData, setFeedbackData] = useState([]);
  const [courseInfo, setCourseInfo] = useState(null);
  const [responses, setResponses] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeedbackQuestions = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/studentfeedback/questions/${sid}`, {
          params: { usercourseid },
        });

        // Get course info if available in the response
        if (response.data.length > 0 && response.data[0].course_name) {
          setCourseInfo({
            name: response.data[0].course_name,
            code: response.data[0].course_code,
            faculty: response.data[0].faculty_name
          });
        }

        setFeedbackData(response.data);
        const initialResponses = {};
        response.data.forEach((question) => {
          initialResponses[question.idquestion_main] = "";
        });
        setResponses(initialResponses);
      } catch (err) {
        setError("Failed to fetch feedback data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbackQuestions();
  }, [sid, usercourseid]);

  const handleResponseChange = (id, value) => {
    setResponses((prevResponses) => ({
      ...prevResponses,
      [id]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const answers = Object.entries(responses).map(([idquestion_main, marks]) => ({
        sid,
        idquestion_main,
        marks: parseInt(marks),
      }));

      await api.post(`/api/studentfeedback/updatemarks`, {answers});
      setHasSubmitted(true);
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setError("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const allQuestionsAnswered = Object.values(responses).every((response) => response !== "");
  
  const handleNextStep = () => {
    if (currentStep < feedbackData.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const getProgressPercentage = () => {
    const answeredCount = Object.values(responses).filter(r => r !== "").length;
    return Math.round((answeredCount / feedbackData.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <FaSpinner className="animate-spin text-blue-500 text-4xl mb-4" />
        <p className="text-gray-600 text-xl">Loading Course Exit Survey...</p>
        <p className="text-gray-500 mt-2">Please wait while we prepare your questions</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center justify-center text-red-500 mb-4">
            <FaExclamationTriangle className="text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Error Loading Survey</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <div className="flex justify-center">
            <button 
              onClick={() => navigate(-1)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors flex items-center"
            >
              <FaArrowLeft className="mr-2" /> Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (hasSubmitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="flex items-center justify-center text-green-500 mb-4">
            <FaCheckCircle className="text-6xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Thank You!</h2>
          <p className="text-gray-600 mb-6">Your feedback has been submitted successfully.</p>
          <button 
            onClick={() => navigate("/")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <div className="flex items-center">
              <FaClipboardList className="text-blue-500 text-2xl mr-3" />
              <h1 className="text-2xl font-bold text-gray-800">Course Exit Survey</h1>
            </div>
            <div className="w-5"></div> {/* Empty div for flex alignment */}
          </div>
          
          {courseInfo && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h2 className="font-semibold text-lg text-blue-800">{courseInfo.name}</h2>
              {courseInfo.code && <p className="text-blue-600 text-sm">Course Code: {courseInfo.code}</p>}
              {courseInfo.faculty && <p className="text-blue-600 text-sm">Faculty: {courseInfo.faculty}</p>}
            </div>
          )}
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{getProgressPercentage()}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 italic">* All questions are required</p>
        </div>

        {/* Survey Content */}
        <div className="space-y-6">
          {feedbackData.length > 0 ? (
            <>
              {/* Single Question View */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6 transition-all duration-300">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Question {currentStep + 1} of {feedbackData.length}
                  </h2>
                  <p className="text-lg text-gray-700">
                    {feedbackData[currentStep].qname} <span className="text-red-500">*</span>
                  </p>
                </div>

                <div className="space-y-3">
                  {["3", "2", "1", "0"].map((value, optionIndex) => {
                    const labels = ["Strongly agree", "Agree", "Neutral", "Disagree"];
                    const bgColors = ["bg-green-50", "bg-blue-50", "bg-yellow-50", "bg-red-50"];
                    const borderColors = ["border-green-200", "border-blue-200", "border-yellow-200", "border-red-200"];
                    const textColors = ["text-green-800", "text-blue-800", "text-yellow-800", "text-red-800"];
                    
                    return (
                      <label 
                        key={optionIndex} 
                        className={`block w-full p-4 rounded-lg border ${
                          responses[feedbackData[currentStep].idquestion_main] === value 
                            ? `${borderColors[optionIndex]} ${bgColors[optionIndex]}` 
                            : "border-gray-200 hover:bg-gray-50"
                        } cursor-pointer transition-colors`}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name={`question-${feedbackData[currentStep].idquestion_main}`}
                            value={value}
                            checked={responses[feedbackData[currentStep].idquestion_main] === value}
                            onChange={() => handleResponseChange(feedbackData[currentStep].idquestion_main, value)}
                            className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="ml-3">
                            <span className={`font-medium ${
                              responses[feedbackData[currentStep].idquestion_main] === value 
                                ? textColors[optionIndex] 
                                : "text-gray-700"
                            }`}>
                              {labels[optionIndex]}
                            </span>
                            <p className="text-sm text-gray-500">
                              {["Completely satisfied", "Mostly satisfied", "Somewhat satisfied", "Not satisfied"][optionIndex]}
                            </p>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mb-8">
                <button
                  className={`px-4 py-2 rounded-md flex items-center ${
                    currentStep > 0 
                      ? "bg-gray-200 hover:bg-gray-300 text-gray-800" 
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                >
                  <FaArrowLeft className="mr-2" /> Previous
                </button>
                
                {currentStep < feedbackData.length - 1 ? (
                  <button
                    className={`px-4 py-2 rounded-md flex items-center ${
                      responses[feedbackData[currentStep].idquestion_main] 
                        ? "bg-blue-500 hover:bg-blue-600 text-white" 
                        : "bg-blue-300 text-white cursor-not-allowed"
                    }`}
                    onClick={handleNextStep}
                    disabled={!responses[feedbackData[currentStep].idquestion_main]}
                  >
                    Next <span className="ml-2">→</span>
                  </button>
                ) : (
                  <button
                    className={`px-6 py-2 rounded-md flex items-center ${
                      allQuestionsAnswered 
                        ? "bg-green-500 hover:bg-green-600 text-white" 
                        : "bg-green-300 text-white cursor-not-allowed"
                    }`}
                    onClick={handleSubmit}
                    disabled={!allQuestionsAnswered || submitting}
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" /> Submitting...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className="mr-2" /> Submit Survey
                      </>
                    )}
                  </button>
                )}
              </div>
              
              {/* Question Dots Navigation */}
              <div className="flex justify-center flex-wrap gap-2 mb-8">
                {feedbackData.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentStep 
                        ? "bg-blue-500 transform scale-125" 
                        : responses[feedbackData[index].idquestion_main] 
                          ? "bg-green-500" 
                          : "bg-gray-300"
                    }`}
                    aria-label={`Go to question ${index + 1}`}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">No survey questions available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewFeedback;