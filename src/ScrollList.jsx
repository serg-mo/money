import React, { useState, useCallback } from "react";

export default function ScrollList({ options, value, onChange }) {
  const [selectedOption, setSelectedOption] = useState(value);

  // Handle changing the select dropdown
  const handleChange = (e) => {
    const newValue = e.target.value;
    setSelectedOption(newValue);
    onChange(newValue);
  };

  return (
    <select
      value={selectedOption}
      onChange={handleChange}
      className="form-select block outline-none mt-1 m-auto"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
