// import React, { useEffect, useState } from "react"
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import api, { backend_url } from "../../api";

// const StudentSideFeedback = ({ uid }) => {
//     const [Feedbacks, setFeedbacks] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [err, setErr] = useState("");
//     const [responses, setResponses] = useState([]); // State to hold responses for each question
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         const fetchFeedbackData = async () => {
//             if (uid) {
//                 setErr("");
//                 setLoading(true);
//                 try {
//                     const res = await api.get(`/api/lmsclassroom/feedback/show/student/${uid}`);
//                     const fetchedFeedbackData = res.data.feedbackData;
//                     setFeedbacks(fetchedFeedbackData);
//                     console.log("fetchedFeedbackData", fetchedFeedbackData);

//                     // Initialize responses state based on the number of questions
//                     const initialResponses = fetchedFeedbackData[0].questions.map(() => "");
//                     setResponses(initialResponses);
//                 } catch (error) {
//                     console.error("Error fetching feedback data:", error);
//                     setErr(error.response?.data?.error || "An unexpected error occurred");
//                 } finally {
//                     setLoading(false);
//                 }
//             }
//         };

//         fetchFeedbackData();
//     }, [uid]);

//     const navigate = useNavigate();

//     const handleViewClassroom = (feedbackId) => {
//         navigate(`/viewfeedback/${feedbackId}`);
//     };

//     return (
//         <div className="flex flex-col items-center justify-center bg-gray-100">
//             <div className="w-full max-w-7xl px-2 sm:px-4 py-2 sm:py-4">
//                 <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-800 mb-2 sm:mb-4 text-center">Feedbacks</h2>
//                 <button
//                     className="text-blue-500 mb-4 mt-1"
//                     onClick={() => navigate(-1)}
//                 >
//                     &larr; Back to All ClassRoom
//                 </button>
//                 <div className="text-lg text-blue-500 mb-5">Pending Feedback</div>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
//                     {Feedbacks.length > 0 ? (
//                         Feedbacks.map((feedback) => (
//                             <div
//                                 key={feedback.feedback_id}
//                                 className="relative bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
//                             >
//                                 {/* Top section with gradient and course details */}
//                                 <div className="h-24 sm:h-32 bg-gradient-to-r from-teal-500 to-blue-600 rounded-t-lg p-4 flex items-start justify-between">
//                                     <div>
//                                         <h3 className="text-white text-lg sm:text-xl font-semibold">{feedback.feedback_name}</h3>
//                                         {/* <p className="text-white text-xs sm:text-sm">Semester: {feedback.semester}</p> */}
//                                     </div>
//                                     <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500 text-white flex items-center justify-center text-lg sm:text-xl font-bold">
//                                         {feedback.feedback_name.charAt(0).toUpperCase()}
//                                     </div>
//                                 </div>

//                                 {/* Middle section with instructor info */}
//                                 <div className="p-4">
//                                     <p className="text-gray-700 text-sm sm:text-base">Started Date: {new Date(feedback.created_at).toLocaleDateString()}</p>
//                                     <p className="text-gray-700 text-sm sm:text-base">Deadline: {new Date(feedback.deadline).toLocaleDateString()}</p>
//                                 </div>

//                                 {/* Bottom icons */}
//                                 <div className="flex justify-around px-4 pb-4 mt-auto">
//                                     {/* <FaCamera className="text-gray-600 hover:text-gray-800 cursor-pointer transition-transform transform hover:scale-125" size={20} />
//                     <FaFolder className="text-gray-600 hover:text-gray-800 cursor-pointer transition-transform transform hover:scale-125" size={20} /> */}
//                                 </div>

//                                 {/* View Classroom Button */}
//                                 <button
//                                     className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 mx-4 mb-5"
//                                     onClick={() => handleViewClassroom(feedback.feedback_id)}

//                                 >
//                                     Complete Feedback
//                                 </button>
//                             </div>
//                         ))
//                     ) : (
//                         <p className="text-gray-600 text-lg">No Feedbacks available.</p>
//                     )}
//                 </div>
//             </div>
//         </div>

//     );
// }

// export default StudentSideFeedback;