import React from "react";
import Transaction from "./Transaction";
import { CATEGORIES } from "../utils";

export default function UnclassifiedCharges({ transactions, onCategorize }) {
  const filtered = transactions.filter(
    (t) => t["Category"] === CATEGORIES.UNCLASSIFIED,
  );

  return (
    <table className="w-max mx-auto">
      <thead>
        <tr>
          <th colSpan="3" className="text-center">
            Unclassified ({filtered.length})
          </th>
        </tr>
        <tr>
          <th className="text-center">Name</th>
          <th className="text-center">Amount</th>
          <th className="text-center">Category</th>
        </tr>
      </thead>
      <tbody>
        {filtered.map((t, key) => (
          <Transaction key={key} {...t} onClick={onCategorize} />
        ))}
      </tbody>
    </table>
  );
}
