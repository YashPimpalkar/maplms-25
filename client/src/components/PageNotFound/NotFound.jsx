import React from 'react';
import { NavLink } from 'react-router-dom';

const NotFound = () => {
  return (
    <section className='bg-gray-100 fixed left-0 z-45 w-full'>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
        <p className="text-lg text-gray-600">Sorry, the page you're looking for doesn't exist.</p>
        <NavLink 
          to="/" 
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go to Home
        </NavLink>
      </div>
    </section>
  );
};

export default NotFound;
