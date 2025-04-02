import React, { useState } from 'react';
import validateForm from './validate';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { NavLink } from 'react-router-dom';
import api from '../../api';
import LoadingButton from "../../components/Loading/Loading";

const Register = () => {
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '',name: '' });
  const [err, setErr] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors,setErrors]=useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length === 0) {
      if (formData.password !== formData.confirmPassword) {
        setErrors({ confirmPassword: 'Passwords do not match' });
      } else {
        try {
          setLoading(true);
          const res = await api.post("api/register", { email: formData.email, password: formData.password ,name:formData.name });
          console.log(res);
          alert('Form submitted successfully!');
          setIsSubmitted(true);
        } catch (error) {
          console.log(error);
          setErr(error.response.data)
        } finally{
          setLoading(false);
        }
      }
    } else {
      setErrors(validationErrors);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSignInClick = () => {
    setShowSignIn(true);
  };

  const [showSignIn, setShowSignIn] = useState(false);

  // if (showSignIn) {
  //   return <SignInForm />;
  // }

  if (isSubmitted) {
   
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Sign up</h1>
        <h3 className="text-sm text-gray-600 mb-4">Create your account</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Name"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Email"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-2 focus:outline-none"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <HiEyeOff className="h-5 w-5 text-gray-500" /> : <HiEye className="h-5 w-5 text-gray-500" />}
              </button>
             
            </div>
            
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Confirm Password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-2 focus:outline-none"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? <HiEyeOff className="h-5 w-5 text-gray-500" /> : <HiEye className="h-5 w-5 text-gray-500" />}
              </button>
             
            </div>
            {err && <p className='text-red-500 text-sm'>{err}</p>}
            {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
          </div>
          <div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md"
            >
              Submit
            </button>
            <p className='mt-2 text-sm text-gray-600'>
              Already have an account? 
              <NavLink
              type='button'
              className='text-blue-500 hover:text-blue-700 focus:outline-none'
               to="/"
              >Sign In
              </NavLink>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register