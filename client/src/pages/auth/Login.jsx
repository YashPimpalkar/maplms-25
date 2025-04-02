import React, { useEffect, useState } from "react";
import validateForm from "./validate";
import { HiEye, HiEyeOff, HiMail, HiLockClosed } from "react-icons/hi";
import { FcGoogle } from "react-icons/fc";
import { FaMicrosoft, FaApple } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api";
import LoadingButton from "../../components/Loading/Loading";
const img = "/logorb.png";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [user_id, setUID] = useState(0);
  const [usertype, setUserType] = useState(0);
  const [isRegister, setIsRegister] = useState(-1);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [islogin, setLogin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedToken = window.localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);

      const uid = window.localStorage.getItem("uid");
      const sid = window.localStorage.getItem("sid");
      const user_type = window.localStorage.getItem("user_type");
      const isRegister = window.localStorage.getItem("isregister");

      if (storedToken && (uid || sid) && user_type && isRegister) {
        if (uid) {
          setUID(parseInt(uid));
        } else if (sid) {
          setUID(parseInt(sid));
        }
        setUserType(parseInt(user_type));
        setIsRegister(parseInt(isRegister));

        // Redirect to home if already logged in
        navigate("/");
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length === 0) {
      try {
        setLoading(true);
        const res = await api.post("api/login", {
          email: formData.email,
          password: formData.password,
        });
        window.localStorage.setItem("uid", res.data.uid);
        window.localStorage.setItem("token", res.data.token);
        window.localStorage.setItem("user_type", res.data.user_type);
        window.localStorage.setItem("isregister", res.data.isregister);
        setLogin(true);
        navigate("/");
        window.location.reload();
      } catch (err) {
        setErr(err.response?.data || "Login failed. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      setErrors(validationErrors);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (showSignUp) {
    navigate("/register");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row mt-2">
        {/* Left side - Brand/Logo */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-800 p-12 flex flex-col justify-between hidden md:block">
          <div className="mb-8 flex justify-center items-center flex-col h-full">
            <img src={img} alt="Logo" className="h-32 mb-8" />
            <h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Welcome to MAPLMS
            </h1>
            <p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-blue-100 text-lg"
            >
              Your comprehensive learning management system for modern education
            </p>
          </div>
{/* 
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">
                  Streamlined Learning
                </h3>
                <p className="text-blue-100 text-sm">
                  Access all your courses and materials in one place
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Secure Platform</h3>
                <p className="text-blue-100 text-sm">
                  Your data is protected with industry-standard security
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">
                  Real-time Collaboration
                </h3>
                <p className="text-blue-100 text-sm">
                  Connect with students and colleagues instantly
                </p>
              </div>
            </div>
          </div> */}
        </div>

        {/* Right side - Login Form */}
        <div className="w-full md:w-1/2 p-12">
          {/* User Type Tabs */}
          <div className="bg-gray-100 rounded-lg p-1 flex mb-8">
            <button
              onClick={() => navigate("/")}
              className={`w-1/2 py-3 text-sm font-medium rounded-md transition-all ${
                location.pathname === "/"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Student Login
            </button>
            <button
              onClick={() => navigate("/teacher")}
              className={`w-1/2 py-3 text-sm font-medium rounded-md transition-all ${
                location.pathname === "/teacher"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Teacher Login
            </button>
          </div>

          <div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Teacher Portal
            </h2>
            <p className="text-gray-600 mb-8">
              Please sign in to your teacher account
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 block w-full border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 text-sm text-red-600"
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <a
                    href="/forgot-password"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiLockClosed className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 block w-full border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <HiEye className="h-5 w-5" />
                    ) : (
                      <HiEyeOff className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 text-sm text-red-600"
                  >
                    {errors.password}
                  </p>
                )}
              </div>

              {err && (
                <div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="text-sm text-red-600">{err}</p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : "Sign in"}
                </button>
              </div>
            </form>

            {/* <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <FcGoogle className="h-5 w-5" />
                </button>
                <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <FaMicrosoft className="h-5 w-5 text-blue-500" />
                </button>
                <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <FaApple className="h-5 w-5" />
                </button>
              </div>
            </div> */}

            {/* <p className="mt-8 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Create an account
              </button>
            </p> */}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} MAPLMS. All rights reserved.</p>
        {/* <div className="mt-2 space-x-4">
          <a href="#" className="text-gray-500 hover:text-gray-700">
            Privacy Policy
          </a>
          <a href="#" className="text-gray-500 hover:text-gray-700">
            Terms of Service
          </a>
          <a href="#" className="text-gray-500 hover:text-gray-700">
            Contact Us
          </a>
        </div> */}
      </div>
    </div>
  );
};

export default Login;
