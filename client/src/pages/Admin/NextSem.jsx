// // NextSemesterButton.js
// import React from 'react';
// import api from "../../api";

// const NextSemesterButton = () => {
//     const handleNextSemester = async () => {
//         try {
//           const response = await api.post("api/lmsstudents/admin/nextsem");
//           alert(response.data.message);
//         } catch (error) {
//           console.error(error);
//           alert('Failed to promote students to the next semester');
//         }
//       };
      

//   return (
//     <div className="max-w-screen-xl mx-auto container p-8 bg-gray-50 min-h-screen flex flex-col items-center space-y-6">
//     <h1 className="text-2xl md:text-3xl lg:text-4xl text-blue-700 text-center font-extrabold mt-8 mb-4 leading-tight">
//         Promote all Students to the Next Semester
//     </h1>
//     <h2 className="text-xl md:text-2xl lg:text-3xl text-blue-600 text-center font-semibold mb-8">
//         Click the button below to proceed
//     </h2>
//     <button
//         onClick={handleNextSemester}
//         className="px-6 py-3 text-lg bg-blue-500 text-white font-medium rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2 transition duration-300 ease-in-out transform hover:scale-105"
//     >
//         Promote to Next Semester
//     </button>
// </div>
  
//   );
// };

// export default NextSemesterButton;
