import React, { useState, useEffect } from "react";
import CreditChart from "./credit/CreditChart";
import RecurringCharges from "./credit/RecurringCharges";
import { getCategory, parseCSV } from "./utils";

function parseTransactions(lines, headers) {
  return lines.map(parseCSV).map((fields) => {
    return headers.reduce((obj, header, index) => {
      const value =
        header === "Amount" ? parseFloat(fields[index]) : fields[index]; // Amount as a number

      if (header === "Name") {
        return { ...obj, [header]: value, Category: getCategory(value) };
      }

      return { ...obj, [header]: value };
    }, {});
  });
}

function parseFile(lines) {
  const headers = parseCSV(lines[0]); // "Date","Transaction","Name","Memo","Amount"
  const tail = lines.slice(1, lines.length - 1);

  return parseTransactions(tail, headers);
}

// TODO: add arrow key handlers to zoom in/out and shift left/right
export default function DashboardCredit({ file }) {
  const [transactions, setTransactions] = useState([]);

  if (!transactions.length) {
    let reader = new FileReader();
    reader.onload = (e) => {
      const lines = e.target.result.split(/\r?\n/); // FileReader
      setTransactions(parseFile(lines));
    };
    reader.readAsText(file);
  }

  if (!transactions.length) {
    return;
  }

  const filteredTransactions = transactions.filter(
    (row) => row["Transaction"] === "DEBIT",
  );

  return (
    <div>
      <CreditChart transactions={filteredTransactions} />
      <RecurringCharges transactions={filteredTransactions} />
      <table className="w-max mx-auto">
        <thead>
          <tr>
            <th colSpan="2" className="text-center">
              Unclassified
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions
            .filter((t) => t["Category"] === "OTHER")
            .map((t, key) => (
              <tr key={key}>
                <td>
                  {t["Name"]} {t["Amount"]}
                </td>
                <td>{t["Category"]}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
