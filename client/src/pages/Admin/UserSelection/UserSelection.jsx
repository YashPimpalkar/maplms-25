// import React, { useEffect, useState } from 'react';
// import api from '../../../api'; // Ensure this imports your API utility


// const UserSelection = () => {
//   const [users, setUsers] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchTerm, setSearchTerm] = useState('');
//   const usersPerPage = 5;

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const res = await api.post('api/register/getusers');
//         setUsers(res.data);
//       } catch (error) {
//         console.error("Error fetching users:", error);
//       }
//     };

//     fetchUsers();
//   }, []);

//   const handleUserTypeChange = async (index, newType) => {
//     const updatedUser = users[index];
//     try {
//       await api.post('api/register/updateusertype', {
//         userid: updatedUser.userid,
//         newType: newType
//       });
      
//       const updatedUsers = users.map((user, i) =>
//         i === index ? { ...user, isuser: newType } : user
//       );
//       setUsers(updatedUsers);
//     } catch (error) {
//       console.error("Error updating user type:", error);
//     }
//   };

 

//   const handleDeleteUser = async (userId) => {
//     try {
//       // Make DELETE request with userId as a parameter in the URL
//       await api.delete(`api/register/deleteuser/${userId}`);
//       setUsers(users.filter(user => user.userid !== userId));
//     } catch (error) {
//       console.error("Error deleting user:", error);
//     }
//   };
  

//   // Filter users based on search term
//   const filteredUsers = users.filter(user =>
//     user.emailid.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // Calculate the indices of the users to be displayed on the current page
//   const indexOfLastUser = currentPage * usersPerPage;
//   const indexOfFirstUser = indexOfLastUser - usersPerPage;
//   const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

//   // Calculate the total number of pages
//   const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

//   const handleClick = (event) => {
//     setCurrentPage(Number(event.target.id));
//   };

//   const renderPageNumbers = [];
//   for (let i = 1; i <= totalPages; i++) {
//     renderPageNumbers.push(
//       <li key={i} className={`mx-1 ${i === currentPage ? 'text-blue-500' : ''}`}>
//         <button onClick={handleClick} id={i} className="px-2 py-1">
//           {i}
//         </button>
//       </li>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-90">
//       <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-7xl mx-auto mt-2">
//         <div className="flex justify-between items-center mb-4">
//           <h1 className="text-2xl font-bold">Admin User Selection</h1>
//           {/* Search Input */}
//           <input
//             type="text"
//             placeholder="Search by email..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="p-2 border border-blue-500 rounded w-1/3 sm:w-1/4 md:w-1/5 lg:w-1/6"
//           />
//         </div>

//         <div className="overflow-x-auto">
//           <table className="min-w-full bg-white">
//             <thead>
//               <tr>
//                 <th className="py-2 px-4 border-b-2 border-gray-300 text-center">Index</th>
//                 <th className="py-2 px-4 border-b-2 border-gray-300 text-center">Email</th>
//                 <th className="py-2 px-4 border-b-2 border-gray-300 text-center">User Type</th>
//                 <th className="py-2 px-4 border-b-2 border-gray-300 text-center">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentUsers.map((user, index) => (
//                 <tr key={user.userid} className="hover:bg-gray-100">
//                   <td className="py-2 px-4 border-b border-gray-300 text-center">{indexOfFirstUser + index + 1}</td>
//                   <td className="py-2 px-4 border-b border-gray-300 text-center">{user.emailid}</td>
//                   <td className="py-2 px-4 border-b border-gray-300 text-center">
//                     <select
//                       value={user.isuser}
//                       onChange={(e) => handleUserTypeChange(indexOfFirstUser + index, e.target.value)}
//                       className="block w-full p-2 border border-gray-300 rounded mx-auto"
//                     >
//                       <option value="1">User Type 1</option>
//                       <option value="2">User Type 2</option>
//                       <option value="3">User Type 3</option>
//                     </select>
//                   </td>
//                   <td className="py-2 px-4 border-b border-gray-300 text-center">
//                     <button
//                       onClick={() => handleDeleteUser(user.userid)}
//                       className="text-red-500 hover:text-red-700"
//                     >
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
        
//         <ul className="flex justify-center mt-4">
//           {renderPageNumbers}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default UserSelection;
