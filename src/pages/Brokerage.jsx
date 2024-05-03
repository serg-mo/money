import React, { useState, useEffect } from "react";
// TODO: move all of these into ./brokerage/
import BalanceChart from "../components/BalanceChart";
import CashFlowChart from "../components/CashFlowChart";
import IncomeChart from "../components/IncomeChart";
import DragAndDrop from "../components/DragAndDrop";

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

export default () => <DragAndDrop render={(files) => <Brokerage files={files} />} />