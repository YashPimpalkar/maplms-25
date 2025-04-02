import React from 'react';

const ExportImportButtons = ({ onExport, onImport }) => {
  return (
    <div className="flex justify-center space-x-4 mb-4">
      <button
        onClick={onExport}
        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
      >
        Export to Excel
      </button>
      <label className="px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600">
        Import Excel
        <input
          type="file"
          onChange={(e) => onImport(e.target.files[0])}
          accept=".xlsx, .xls"
          className="hidden"
        />
      </label>
    </div>
  );
};

export default ExportImportButtons;
