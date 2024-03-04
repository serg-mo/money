import React, { useState, useEffect } from "react";
import CreditChart from "./credit/CreditChart";
import RecurringCharges from "./credit/RecurringCharges";
import CreditTransactions from "./credit/CreditTransactions";
import { CATEGORIES, getCategory, parseCSV } from "./utils";

function parseTransactions(lines, headers) {
  return lines.map(parseCSV).map((fields) => {
    return headers.reduce((obj, header, index) => {
      let value = fields[index];

      if (header === "Amount") {
        value = parseFloat(value);
      }

      return { ...obj, [header]: value, Category: CATEGORIES.UNCLASSIFIED };
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
  const [debits, setDebits] = useState([]);
  const [rules, setRules] = useState({});

  // TODO: load existing rules
  useEffect(() => {
    // when rules state changes, save a copy to local storage
    localStorage.setItem("rules", JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    if (!transactions.length) {
      let reader = new FileReader();
      reader.onload = (e) => {
        const lines = e.target.result.split(/\r?\n/); // FileReader
        setTransactions(parseFile(lines));
      };
      reader.readAsText(file);
    }
  }, [transactions]);

  useEffect(() => {
    if (transactions.length) {
      setDebits(transactions.filter((row) => row["Transaction"] === "DEBIT"));
    }
  }, [transactions]);

  const onCategorize = (name, category) => {
    // TODO: prune the name first
    // write/overwrite the category for that
    setRules((existing) => {
      return { ...existing, [name]: category };
    });
  };

  if (!debits.length) {
    return;
  }

  // TODO: use context to access debits
  // TODO: these should be tabs + a tab for each category
  return (
    <div className="font-mono text-xs">
      <div>{JSON.stringify(rules)}</div>

      <CreditChart transactions={debits} />
      <RecurringCharges transactions={debits} />
      <CreditTransactions
        transactions={debits}
        onCategorize={onCategorize}
        category={CATEGORIES.UNCLASSIFIED}
      />
    </div>
  );
}
