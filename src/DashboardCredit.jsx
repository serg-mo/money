import React, { useState, useEffect } from "react";
import CreditChart from "./credit/CreditChart";
import RecurringCharges from "./credit/RecurringCharges";
import UnclassifiedCharges from "./credit/UnclassifiedCharges";
import { getCategory, parseCSV } from "./utils";

function parseTransactions(lines, headers) {
  return lines.map(parseCSV).map((fields) => {
    return headers.reduce((obj, header, index) => {
      let value = fields[index];

      if (header === "Amount") {
        value = parseFloat(value);
      }

      return { ...obj, [header]: value, Category: "OTHER" };
    }, {});
  });
}

function parseFile(lines) {
  const headers = parseCSV(lines[0]); // "Date","Transaction","Name","Memo","Amount"
  const tail = lines.slice(1, lines.length - 1);

  // TODO: load rules here
  const rules = {};

  const transactions = parseTransactions(tail, headers);

  // TODO: add Category here
  // return { ...obj, [header]: value, Category: getCategory(value) };

  return transactions;
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
      <UnclassifiedCharges transactions={filteredTransactions} />
    </div>
  );
}
