import React, { useState, useEffect } from "react";
import Credit from "./Credit";
import Brokerage from "./Brokerage";

/*
import React, { useState } from "react";
import Dashboard from "./Dashboard";

export default function App() {
  // multiple files, e.g., brokerage, checking, credit
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
*/

export default function Home() {
  return <></>;
}

/*
export default function Home({ files }) {
  // TODO: parse more than one file
  // TODO: determine schema by looking at it, brokerage vs credit type Dashboard
  const file = files[0];
  const TypedDashboard = true ? Credit : Brokerage;

  return (
    <div className="w-4xl max-w-4xl m-auto">
      <TypedDashboard file={file} />
    </div>
  );
}
*/
