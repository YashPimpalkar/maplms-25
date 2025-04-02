import React from 'react'
import { FaChalkboardTeacher, FaBook, FaChartBar, FaSignOutAlt,FaCalendarAlt } from 'react-icons/fa';
import 'tailwindcss/tailwind.css';
import { Link, useNavigate } from 'react-router-dom';

function TeaacherSidebar() {
     const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.clear(); // Clear local storage
        navigate('/'); // Redirect to login page or home page
        window.location.reload(); // Optional: Reload the page to ensure state is reset
      };
  return (
    <div className='flex flex-col md:flex-row bg-gray-100 top-10 '>
        <aside className="w-full md:w-64 bg-blue-900 text-white shadow-lg">
        <div className="p-4 md:p-6">
          <h1 className="text-xl md:text-2xl text-white font-bold">Teacher Dashboard</h1>
        </div>
        <nav className="mt-4 md:mt-10">
          <ul>
            <li className="px-4 py-2 md:py-3 hover:bg-blue-700 flex items-center justify-center md:justify-start">
              <FaChalkboardTeacher className="mr-2" />
              <Link to="/" className="text-sm md:text-base">Dashboard</Link>
            </li>
            <li className="px-4 py-2 md:py-3 hover:bg-blue-700 flex items-center justify-center md:justify-start">
              <FaBook className="mr-2" />
              <Link to="/usercourse" className="text-sm md:text-base">Show Courses</Link>
            </li>
            <li className="px-4 py-2 md:py-3 hover:bg-blue-700 flex items-center justify-center md:justify-start">
              <FaChartBar className="mr-2" />
              <Link to="/coposhow" className="text-sm md:text-base">CO PO Attainment</Link>
            </li>
            <li className="px-4 py-2 md:py-3 hover:bg-blue-700 flex items-center justify-center md:justify-start">
              <FaCalendarAlt className="mr-2" />
              <Link to="/calendar" className="text-sm md:text-base">Calendar</Link>
            </li>
            <li className="px-4 py-2 md:py-3 hover:bg-blue-700 flex items-center justify-center md:justify-start">
              <button onClick={handleLogout} className="flex items-center">
                <FaSignOutAlt className="mr-2" />
                <span className="text-sm md:text-base">Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </div>
  )
}

export default TeaacherSidebar