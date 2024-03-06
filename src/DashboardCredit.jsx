import React, { useState, useEffect } from "react";
import CreditChart from "./credit/CreditChart";
import RecurringCharges from "./credit/RecurringCharges";
import CreditTransactions from "./credit/CreditTransactions";
import {
  CATEGORIES,
  parseCreditFile,
  getCategory,
  normalizeName,
} from "./utils";

// TODO: add arrow key handlers to zoom in/out and shift left/right
export default function DashboardCredit({ file }) {
  const [transactions, setTransactions] = useState([]);
  const [debits, setDebits] = useState([]);
  const [rules, setRules] = useState({});
  const [isCategorized, setIsCategorized] = useState(true);

  useEffect(() => {
    // load existing rules from local storage, which persists across sessions
    const existingRules = JSON.parse(localStorage.getItem("rules"));
    if (existingRules && Object.keys(existingRules).length) {
      setRules(existingRules);
    }

    // load transactions from a file into component state
    let reader = new FileReader();
    reader.onload = (e) => {
      const lines = e.target.result.split(/\r?\n/); // FileReader
      setTransactions(parseCreditFile(lines));
      setIsCategorized(false); // trigger re-categorization
    };
    reader.readAsText(file);
  }, []);

  // when rules change, persist them
  useEffect(() => {
    if (Object.keys(rules).length) {
      localStorage.setItem("rules", JSON.stringify(rules));
    }
  }, [rules]);

  useEffect(() => {
    // NOTE: rules and transactions are loaded asynchronously
    // re-categorize when rules and transactions are loaded, but not categorized (initial state)
    if (Object.keys(rules).length && transactions.length && !isCategorized) {
      setTransactions((existing) =>
        existing.map((t) => {
          return { ...t, category: getCategory(t["name"], rules) };
        }),
      );

      setIsCategorized(true); // stop infinite re-categorization
    }
  }, [rules, isCategorized]);

  // debits change when transactions change, but that only happens once per session
  useEffect(() => {
    if (transactions.length) {
      setDebits(transactions.filter((row) => row["transaction"] === "DEBIT"));
    }
  }, [transactions]);

  const onCategorize = (name, category) => {
    // prune/normalize the name to remove any unique identifiers
    name = normalizeName(name);

    // overwrite any existing rules for that name
    setRules((existing) => {
      return { ...existing, [name]: category };
    });
    setIsCategorized(false); // trigger re-categorization
  };

  if (!debits.length) {
    return;
  }

  // TODO: use context to access debits
  // TODO: these should be tabs + a tab for each category
  return (
    <div className="font-mono text-xs">
      <div className="text-center">{Object.keys(rules).length} rules</div>

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
