import React, { useState, useEffect } from "react";
import Dashboard from "./Dashboard";

const parseCSV = (str) =>
  str.split('","').map((one) => one.replace(/^"|"$/g, ""));

function App() {
  const [file, setFile] = useState();
  const [transactions, setTransactions] = useState([]);

  function handleChange(event) {
    setFile(event.target.files[0]);
  }

  function parseTransactions(lines, headers) {
    return lines.map(parseCSV).map((fields) => {
      return headers.reduce((obj, header, index) => {
        let value = "";
        if (index == 0) {
          value = fields[index].slice(0, 3) + " " + fields[index].slice(-4); // e.g., Jan 2022
        } else {
          value = parseFloat(fields[index].replace(/[\$,]/g, '')); 
        }
        
        return { ...obj, [header]: value };
      }, {});
    });
  }

  useEffect(() => {
    if (!file) {
      return;
    }

    let reader = new FileReader();
    reader.onload = (e) => {
      const lines = e.target.result.split(/\r?\n/); // FileReader

      const header = lines.slice(0, 4); // title, account, date range, headers
      const middle = lines.slice(4, lines.length - 8);
      const tail = lines.slice(lines.length - 8); // blank, report date, 6 lines of junk

      const headers = parseCSV(header[3]);
      setTransactions(parseTransactions(middle, headers));
    };
    reader.readAsText(file);
  }, [file]);

  if (transactions.length > 0) {
    return <Dashboard transactions={transactions} />;
  }

  return (
    <div className="flex justify-center items-center align-middle">
      <div className="relative z-0">
        <input
          type="file"
          onChange={handleChange}
          className="absolute inset-0 flex justify-center items-center z-10 w-full opacity-0"
        />
        <div className="w-96 h-96 flex justify-center items-center text-center text-5xl p-10 border-2 rounded-xl">
          Drag and Drop CSV
        </div>
      </div>
    </div>
  );
}

export default App;
