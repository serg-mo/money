import React from "react";
import CreditTransaction from "./CreditTransaction";
import { CATEGORIES } from "../utils";

export default function CreditTransactions({
  transactions,
  onCategorize,
  category,
}) {
  const filtered = category
    ? transactions.filter((t) => t["Category"] === category)
    : transactions;

  return (
    <table className="w-full mx-auto">
      <thead>
        <tr>
          <th colSpan={3}>
            {category} ({filtered.length})
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
