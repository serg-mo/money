import React, { useState, useContext } from "react";
import CreditTransactions from "./CreditTransactions";
import { CATEGORIES, CreditContext } from "../../utils/credit";

export default function CreditTransactionsTab({ onCategorize }) {
  const { transactions } = useContext(CreditContext);

  const [tab, setTab] = useState(CATEGORIES.UNCLASSIFIED); // TODO: type CATEGORIES,
  const tabTransactions = transactions.filter((t) => t["category"] === tab);

  const counts = Object.values(CATEGORIES).map(
    (tab) => [...transactions].filter((t) => t["category"] === tab).length,
  );

  const tabClass = "p-1 font-medium bg-gray-200 hover:bg-gray-400";
  const activeTabClass = "bg-gray-400";

  // TODO: add counts to tab names
  return (
    <div className="font-mono text-xs">
      <div className="text-sm divide-x-1 divide-blue-400 divide-solid">
        {Object.values(CATEGORIES).map((category, index) => (
          <button
            key={category}
            className={`${tabClass} ${category === tab ? activeTabClass : ""}`}
            onClick={() => setTab(category)}
          >
            {category} ({counts[index]})
          </button>
        ))}
      </div>

      <CreditTransactions
        title={tab}
        transactions={tabTransactions}
        onCategorize={onCategorize}
      />
    </div>
  );
}
