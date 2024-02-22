import React, { useState } from "react";
import Dashboard from "./Dashboard";

export default function App() {
  // multiple files, e.g., brokerage + checking
  const [files, setFiles] = useState([]);

  function handleChange(event) {
    setFiles(event.target.files);
  }

  if (files.length > 0) {
    return <Dashboard files={files} />;
  }

  return (
    <div className="flex justify-center items-center align-middle">
      <div className="relative z-0">
        <input
          type="file"
          multiple
          onChange={handleChange}
          accept="text/csv"
          className="absolute inset-0 flex justify-center items-center z-10 w-full opacity-0"
        />
        <div className="w-96 h-96 flex justify-center items-center text-center text-5xl p-10 border-2 rounded-xl">
          Drag and Drop CSV
        </div>
      </div>
    </div>
  );
}
