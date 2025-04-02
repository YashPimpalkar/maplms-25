import React from "react";

const FilteredCurriculum = ({ filteredCurriculum, selectedCurriculumId, onSelect }) => {
  if (!filteredCurriculum) {
    return <p className="text-gray-500 text-center">Please select a course to view the curriculum.</p>;
  }

  if (filteredCurriculum.length === 0) {
    return <p className="text-gray-500 text-center">No curriculum data available for the selected TWID.</p>;
  }

  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-4 border-b border-gray-200 px-4">
      {filteredCurriculum.map((item) => (
        <button
          key={item.idcurriculum}
          className={`px-4 py-2 sm:px-6 sm:py-3 text-sm font-medium rounded-lg ${
            selectedCurriculumId === item.idcurriculum
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-blue-600 hover:border-blue-600"
          } transition focus:outline-none`}
          onClick={() => onSelect(item.idcurriculum)}
        >
          {item.curriculum_name.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default FilteredCurriculum;
