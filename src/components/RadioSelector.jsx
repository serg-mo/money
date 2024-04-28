import React from "react";

export default function RadioSelector({ options, value, onChange }) {
  return (
    <div className="flex items-center justify-center">
      {options.map((key) => (
        <label key={key} className="inline-flex items-center ml-6">
          <input
            type="radio"
            className="form-radio h-5 w-5"
            checked={value === key}
            value={key}
            onChange={onChange}
          />
          <span className="ml-2">{key}</span>
        </label>
      ))}
    </div>
  );
}
