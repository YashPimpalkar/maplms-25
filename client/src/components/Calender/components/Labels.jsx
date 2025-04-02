import React, { useContext } from "react";
import GlobalContext from "../context/GlobalContext";

export default function Labels() {
  const { labels, updateLabel } = useContext(GlobalContext);
  
  const defaultLabels = [
    { label: "red", checked: true },
    { label: "yellow", checked: true },
    { label: "green", checked: true },
    { label: "blue", checked: true },
    { label: "purple", checked: true },
    { label: "orange", checked: true },
    { label: "gray", checked: true }
  ];

  // Ensure all default labels are present
  const allLabels = [...defaultLabels];
  
  // Add any existing labels from context and preserve their checked state
  if (labels.length > 0) {
    labels.forEach(contextLabel => {
      const existingIndex = allLabels.findIndex(l => l.label === contextLabel.label);
      if (existingIndex !== -1) {
        allLabels[existingIndex] = contextLabel;
      } else {
        allLabels.push(contextLabel);
      }
    });
  }

  const colorClasses = {
    red: "accent-red-400",
    yellow: "accent-yellow-400",
    green: "accent-green-400",
    blue: "accent-blue-400",
    purple: "accent-purple-400",
    orange: "accent-orange-400",
    gray: "accent-gray-400",
  };

  return (
    <React.Fragment>
      <p className="text-gray-500 font-bold mt-10">Label</p>
      {allLabels.map(({ label: lbl, checked }, idx) => (
        <label key={idx} className="flex justify-start items-center mt-3 p-1">
          <input
            type="checkbox"
            checked={checked}
            onChange={() => updateLabel({ label: lbl, checked: !checked })}
            className={`form-checkbox h-5 w-5 ${colorClasses[lbl] || "bg-gray-400"} rounded focus:ring-0 cursor-pointer`}
          />
          <span className="ml-2 text-gray-700 capitalize">
            {lbl === "red"
              ? "Not Started"
              : lbl === "yellow"
              ? "In Progress"
              : lbl === "green"
              ? "Completed"
              : lbl === "blue"
              ? "Review"
              : lbl === "purple"
              ? "On Hold"
              : lbl === "orange"
              ? "Pending Approval"
              : lbl === "gray"
              ? "Draft"
              : lbl}
          </span>
        </label>
      ))}
    </React.Fragment>
  );
}