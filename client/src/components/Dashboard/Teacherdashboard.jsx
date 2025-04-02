import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaChalkboardTeacher, FaBook, FaChartBar, FaSignOutAlt, FaCalendarAlt, FaGraduationCap } from 'react-icons/fa';
import 'tailwindcss/tailwind.css';
import api from '../../api';
import Celebration from '../Celebration/Celebration';
import TeaacherSidebar from './TeaacherSidebar';

function TeacherDashboard() {
  const [attainmentHistory, setAttainmentHistory] = useState([]);
  const [userName, setUserName] = useState("Teacher");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  return (
    <div className='fixed left-0 z-45 w-full mt-8'>
      <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <header className="bg-white shadow-lg p-6 rounded-xl mb-8 border-l-4 border-blue-600">
            <h2 className="text-3xl lg:text-4xl text-blue-800 font-extrabold">
              Welcome,{userName}
            </h2>
            <p className="text-gray-600 mt-2">Manage your courses and track student progress</p>
          </header>

          {/* Dashboard Content */}
          <section className="mt-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Show Courses Card */}
              <div className="bg-white p-6 rounded-xl shadow-lg transform transition duration-500 hover:scale-105 border-t-4 border-blue-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Your Courses</h3>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FaBook className="text-blue-600 text-xl" />
                  </div>
                </div>
                <p className="text-gray-600 mb-6">View and manage your course materials, assignments, and student progress.</p>
                <Link to="/usercourse" className="block w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-800 text-center font-medium transition-all duration-300 shadow-md hover:shadow-lg">
                  View Courses
                </Link>
              </div>

              {/* CO PO Attainment Card */}
              <div className="bg-white p-6 rounded-xl shadow-lg transform transition duration-500 hover:scale-105 border-t-4 border-purple-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Course Attainment</h3>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <FaChartBar className="text-purple-600 text-xl" />
                  </div>
                </div>
                <p className="text-gray-600 mb-6">Track and analyze course outcomes and program objectives attainment.</p>
                <Link to="/coposhow" className="block w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white py-3 px-4 rounded-lg hover:from-purple-600 hover:to-purple-800 text-center font-medium transition-all duration-300 shadow-md hover:shadow-lg">
                  View Attainment
                </Link>
              </div>

              {/* Calendar Card */}
              <div className="bg-white p-6 rounded-xl shadow-lg transform transition duration-500 hover:scale-105 border-t-4 border-green-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Calendar</h3>
                  <div className="p-3 bg-green-100 rounded-full">
                    <FaCalendarAlt className="text-green-600 text-xl" />
                  </div>
                </div>
                <p className="text-gray-600 mb-6">Manage your Schedule, important meetings, and academic events.</p>
                <Link to="/calendar" className="block w-full bg-gradient-to-r from-green-500 to-green-700 text-white py-3 px-4 rounded-lg hover:from-green-600 hover:to-green-800 text-center font-medium transition-all duration-300 shadow-md hover:shadow-lg">
                  View Calendar
                </Link>
              </div>
            </div>
          </section>

          {/* Quick Stats Section */}
          <section className="mt-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-sm text-gray-600">Active Courses</p>
                  <p className="text-2xl font-bold text-blue-700">3</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="text-sm text-gray-600">Students</p>
                  <p className="text-2xl font-bold text-green-700">42</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <p className="text-sm text-gray-600">Assignments</p>
                  <p className="text-2xl font-bold text-purple-700">12</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                  <p className="text-sm text-gray-600">Avg. Performance</p>
                  <p className="text-2xl font-bold text-amber-700">78%</p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Custom CSS for text gradient */}
      <style jsx>{`
        .text-gradient {
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }
      `}</style>
    </div>
  );
}

export default TeacherDashboard;