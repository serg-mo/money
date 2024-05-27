import React, { useState, useMemo } from "react";
import CreditTransaction from "./CreditTransaction";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/20/solid";

// TODO: add column sort toggle
export default function CreditTransactions({
  title,
  transactions,
  onCategorize,
}) {
  const columns = [
    "name",
    "location",
    "date",
    "amount",
    "category",
    "confidence",
  ];

  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });

  if (!transactions.length) {
    return;
  }

  const sortByKey = (key, direction) => (a, b) => {
    if (a[key] < b[key]) {
      return direction === "asc" ? -1 : 1;
    }
    if (a[key] > b[key]) {
      return direction === "asc" ? 1 : -1;
    }
    return 0;
  };

  const sortedTransactions = useMemo(() => {
    if (sortConfig.key) {
      return [...transactions].sort(
        sortByKey(sortConfig.key, sortConfig.direction),
      );
    }
    return transactions;
  }, [transactions, sortConfig]);

  const getChevron = (direction) =>
    direction === "asc" ? (
      <ChevronUpIcon className="inline w-4 h-4 ml-1" />
    ) : (
      <ChevronDownIcon className="inline w-4 h-4 ml-1" />
    );

  return (
    <table className="w-full mx-auto my-2 border-collapse border border-slate-600">
      <thead>
        <tr>
          <th colSpan={5} className="uppercase">
            {title ?? "All"} ({transactions.length})
          </th>
        </tr>
        <tr>
          {columns.map((column) => (
            <th
              key={column}
              className="border border-slate-600 cursor-pointer"
              onClick={() =>
                setSortConfig({
                  key: column,
                  direction: sortConfig.direction === "asc" ? "desc" : "asc", // toggle
                })
              }
            >
              {column.toUpperCase()}
              {sortConfig.key === column && getChevron()}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedTransactions.map((transaction, key) => (
          <CreditTransaction
            key={key}
            {...transaction}
            onClick={(category) => onCategorize(transaction, category)}
          />
        ))}
      </tbody>
    </table>
  );
}
