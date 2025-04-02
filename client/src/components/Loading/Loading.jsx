import React from 'react';

const LoadingButton = () => {
  return (
    <button
  type="button"
  className="bg-indigo-500 text-white font-bold py-2 px-4 rounded inline-flex items-center"
  disabled
>
  <svg
    className="animate-spin h-5 w-5 mr-3 text-white"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
  Processing...
</button>

  );
};

export default LoadingButton;
