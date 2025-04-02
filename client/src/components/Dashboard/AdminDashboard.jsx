import React, { useState, useEffect } from "react";
import { 
  FaUsers, 
  FaBook, 
  FaComments, 
  FaFileAlt, 
  FaBars, 
  FaTimes,
  FaChartLine,
  FaBell,
  FaCalendarAlt
} from "react-icons/fa";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for charts
  const userActivityData = [
    { name: 'Jan', students: 400, teachers: 240, mentors: 180 },
    { name: 'Feb', students: 300, teachers: 220, mentors: 190 },
    { name: 'Mar', students: 500, teachers: 250, mentors: 200 },
    { name: 'Apr', students: 450, teachers: 230, mentors: 210 },
    { name: 'May', students: 600, teachers: 260, mentors: 220 },
    { name: 'Jun', students: 550, teachers: 270, mentors: 230 },
  ];

  const courseData = [
    { name: 'Computer Science', value: 35 },
    { name: 'Electrical', value: 25 },
    { name: 'Mechanical', value: 20 },
    { name: 'Civil', value: 15 },
    { name: 'Other', value: 5 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const recentActivities = [
    { id: 1, user: "John Doe", action: "Enrolled in React Course", date: "Jan 1, 2025", status: "success" },
    { id: 2, user: "Jane Smith", action: "Submitted Feedback", date: "Jan 3, 2025", status: "info" },
    { id: 3, user: "Robert Brown", action: "Generated Report", date: "Jan 4, 2025", status: "warning" },
    { id: 4, user: "Emily Johnson", action: "Updated Profile", date: "Jan 5, 2025", status: "success" },
    { id: 5, user: "Michael Wilson", action: "Requested Mentorship", date: "Jan 6, 2025", status: "info" },
  ];

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      {/* <nav className="bg-white shadow-md px-6 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <button
            className="text-gray-600 focus:outline-none mr-4 md:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
          <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            <FaBell />
          </button>
          <div className="flex items-center">
            <img 
              src="https://randomuser.me/api/portraits/men/32.jpg" 
              alt="Admin" 
              className="w-8 h-8 rounded-full border-2 border-blue-500"
            />
            <span className="ml-2 font-medium text-gray-700 hidden md:inline">Admin User</span>
          </div>
        </div>
      </nav> */}

      <div className="flex mt-5">
        {/* Sidebar */}
        {/* <aside 
          className={`${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } transform md:translate-x-0 transition-transform duration-300 ease-in-out fixed md:sticky top-0 left-0 h-screen bg-gradient-to-b from-blue-800 to-blue-900 text-white w-64 pt-20 md:pt-6 shadow-lg z-30`}
        >
          <div className="px-4">
            <div className="mb-8 text-center">
              <img 
                src="https://randomuser.me/api/portraits/men/32.jpg" 
                alt="Admin" 
                className="w-20 h-20 rounded-full border-4 border-blue-400 mx-auto"
              />
              <h2 className="mt-2 text-xl font-bold">Admin User</h2>
              <p className="text-blue-300 text-sm">System Administrator</p>
            </div>
            
            <nav>
              <ul className="space-y-1">
                <li>
                  <button 
                    onClick={() => setActiveTab("overview")}
                    className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
                      activeTab === "overview" 
                        ? "bg-blue-700 text-white" 
                        : "text-blue-200 hover:bg-blue-700 hover:text-white"
                    }`}
                  >
                    <FaChartLine className="mr-3" />
                    <span>Overview</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab("users")}
                    className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
                      activeTab === "users" 
                        ? "bg-blue-700 text-white" 
                        : "text-blue-200 hover:bg-blue-700 hover:text-white"
                    }`}
                  >
                    <FaUsers className="mr-3" />
                    <span>Users</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab("courses")}
                    className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
                      activeTab === "courses" 
                        ? "bg-blue-700 text-white" 
                        : "text-blue-200 hover:bg-blue-700 hover:text-white"
                    }`}
                  >
                    <FaBook className="mr-3" />
                    <span>Courses</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab("feedback")}
                    className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
                      activeTab === "feedback" 
                        ? "bg-blue-700 text-white" 
                        : "text-blue-200 hover:bg-blue-700 hover:text-white"
                    }`}
                  >
                    <FaComments className="mr-3" />
                    <span>Feedback</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab("reports")}
                    className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
                      activeTab === "reports" 
                        ? "bg-blue-700 text-white" 
                        : "text-blue-200 hover:bg-blue-700 hover:text-white"
                    }`}
                  >
                    <FaFileAlt className="mr-3" />
                    <span>Reports</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </aside> */}

        {/* Main Content */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Page Header */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
                  <p className="text-gray-500">Welcome back, Admin User</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center">
                  <FaCalendarAlt className="text-gray-400 mr-2" />
                  <span className="text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Users</p>
                      <h2 className="text-3xl font-bold text-gray-800 mt-1">1,234</h2>
                      <p className="text-xs text-green-600 mt-1">↑ 12% from last month</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <FaUsers className="text-blue-500 text-xl" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Active Courses</p>
                      <h2 className="text-3xl font-bold text-gray-800 mt-1">56</h2>
                      <p className="text-xs text-green-600 mt-1">↑ 5% from last month</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <FaBook className="text-green-500 text-xl" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Feedbacks</p>
                      <h2 className="text-3xl font-bold text-gray-800 mt-1">420</h2>
                      <p className="text-xs text-yellow-600 mt-1">↑ 8% from last month</p>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-full">
                      <FaComments className="text-yellow-500 text-xl" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Reports</p>
                      <h2 className="text-3xl font-bold text-gray-800 mt-1">89</h2>
                      <p className="text-xs text-red-600 mt-1">↓ 3% from last month</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                      <FaFileAlt className="text-purple-500 text-xl" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                {/* User Activity Chart */}
                <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-2">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">User Activity</h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={userActivityData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="students" fill="#3B82F6" />
                        <Bar dataKey="teachers" fill="#10B981" />
                        <Bar dataKey="mentors" fill="#F59E0B" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Course Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Course Distribution</h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={courseData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {courseData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent Activity Table */}
              <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800">Recent Activities</h2>
                    <button className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                      View All
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentActivities.map((activity) => (
                        <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                                {activity.user.charAt(0)}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{activity.user}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{activity.action}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{activity.date}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(activity.status)}`}>
                              {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
                