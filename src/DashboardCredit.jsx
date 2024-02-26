import React, { useState, useEffect } from "react";
import CreditChart from "./credit/CreditChart";
import RecurringCharges from "./credit/RecurringCharges";

// TODO: generate these, split name on spaces + manual categories
// https://www.npmjs.com/package/decision-tree
const CATEGORIES = [
  { pattern: /AMZN/i, category: "Amazon" },
  { pattern: /SHELL|OIL|GAS|ARCO|CHEVRON/i, category: "Gas" },
  { pattern: /ATT/i, category: "Phone" },
  { pattern: /GEICO|LEMONADE/i, category: "Insurance" },
  { pattern: /WODIFY/i, category: "Gym" },
  { pattern: /PET/i, category: "Pet" },
  { pattern: /SPOTIFY/i, category: "Subscriptions" },
  { pattern: /AIRBNB/i, category: "AirBnB" },
  { pattern: /PARKING/i, category: "Car" },
  { pattern: /ANTHEM/i, category: "Insurance" },
];

const parseCSV = (str) =>
  str.split('","').map((one) => one.replace(/^"|"$/g, ""));

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

function getCategory(name) {
  const match = CATEGORIES.find(({ pattern, category }) => name.match(pattern));
  return match?.category ?? "Other";
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
        <tbody>
          {filteredTransactions
            .filter((t) => t["Category"] === "Other")
            .map((t, key) => (
              <tr key={key}>
                <td>{t["Name"]}</td>
                <td>{t["Category"]}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
