import React from "react";
import CreditTransaction from "./CreditTransaction";
import { CATEGORIES } from "../utils";

// TODO: add column sort toggle
export default function CreditTransactions({
  title,
  transactions,
  onCategorize,
}) {
  if (!transactions.length) {
    return;
  }

  return (
    <table className="w-full mx-auto my-2 border-collapse border border-slate-600">
      <thead>
        <tr>
          <th colSpan={5} className="uppercase">
            {title ?? "All"} ({transactions.length})
          </th>
        </tr>
        <tr>
          <th className="border border-slate-600">Name</th>
          <th className="border border-slate-600 w-80">Location</th>
          <th className="border border-slate-600 w-24">Date</th>
          <th className="border border-slate-600 w-12">Amount</th>
          <th className="border border-slate-600 w-40">Category</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((t, key) => (
          <CreditTransaction
            key={key}
            {...t}
            onClick={(category) => onCategorize(key, category)}
          />
        ))}
      </tbody>
    </table>
  );
}
