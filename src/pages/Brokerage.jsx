import React, { useState, useEffect } from "react";
// TODO: move all of these into ./brokerage/
import BalanceChart from "../components/BalanceChart";
import CashFlowChart from "../components/CashFlowChart";
import IncomeChart from "../components/IncomeChart";
// import DragAndDrop from "../components/DragAndDrop";

const parseCSV = (str) =>
  str.split('","').map((one) => one.replace(/^"|"$/g, ""));

function parseTransactions(lines, headers) {
  return lines.map(parseCSV).map((fields) => {
    return headers.reduce((obj, header, index) => {
      let value = "";

      // reformat first field, "MMM YYYY" -> "MMM YY"
      if (index === 0) {
        value = fields[index].slice(0, 3) + " " + fields[index].slice(-2); // e.g., Jan 22
      } else {
        value = parseFloat(fields[index].replace(/[$,]/g, ""));
      }

      return { ...obj, [header]: value };
    }, {});
  });
}

function parseFile(lines) {
  const header = lines.slice(0, 4); // title, account, date range, headers
  const middle = lines.slice(4, lines.length - 8);
  // const tail = lines.slice(lines.length - 8); // blank, report date, 6 lines of junk

  const headers = parseCSV(header[3]);

  return parseTransactions(middle, headers);
}

// TODO: add arrow key handlers to zoom in/out and shift left/right
function Brokerage({ file }) {
  const [transactions, setTransactions] = useState([]);

  // TODO: combine the two files
  if (!transactions.length) {
    let reader = new FileReader();
    reader.onload = (e) => {
      const lines = e.target.result.split(/\r?\n/); // FileReader
      setTransactions(parseFile(lines));
    };
    reader.readAsText(file);
  }

  return (
    <div>
      <BalanceChart transactions={transactions} />
      <IncomeChart transactions={transactions} />
      <CashFlowChart transactions={transactions} />
    </div>
  );
}

// TODO: this is redundant with Credit + dedicated component
export default function DragAndDrop() {
  // multiple files, e.g., brokerage, checking, credit
  const [files, setFiles] = useState([]);

  function handleChange(event) {
    setFiles(event.target.files);
  }

  if (files.length > 0) {
    return <Brokerage files={files} />;
  }

  return (
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
  );
}
