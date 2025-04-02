import React from 'react';

const SearchBar = ({ value, onChange }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search by index, SID, name, or college ID"
      className="w-full sm:w-1/3 px-4 py-2 border border-gray-300 rounded-md shadow-sm mb-4"
    />
  );
};

export default SearchBar;
