import React from "react";
import CreditTransaction from "./CreditTransaction";
import { CATEGORIES } from "../utils";

// TODO: add column sort
export default function CreditTransactions({
  transactions,
  onCategorize,
  category,
}) {
  const filtered = category
    ? transactions.filter((t) => t["category"] === category)
    : transactions;

  return (
    <table className="w-full mx-auto">
      <thead>
        <tr>
          <th colSpan={3}>
            {category ?? "All"} ({filtered.length})
          </th>
        </tr>
        <tr>
          <th>Name</th>
          <th>Amount</th>
          <th>Category</th>
        </tr>
      </thead>
      <tbody>
        {filtered.map((t, key) => (
          <CreditTransaction key={key} {...t} onClick={onCategorize} />
        ))}
      </tbody>
    </table>
  );
}
