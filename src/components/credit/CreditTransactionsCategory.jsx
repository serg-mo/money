import React, { useState } from "react";
import CreditTransactions from "./CreditTransactions";
import { CATEGORIES } from "../../utils/credit";

export default function CreditTransactionsCategory({
  transactions,
  onCategorize,
}) {
  const [tab, setTab] = useState(CATEGORIES.UNCLASSIFIED); // TODO: type CATEGORIES,
  const tabTransactions = transactions.filter((t) => t["category"] === tab);

  const tabClass = "p-1 font-medium bg-gray-200 hover:bg-gray-400";
  const activeTabClass = "bg-gray-400";

  return (
    <div className="font-mono text-xs">
      <div className="text-sm divide-x-1 divide-blue-400 divide-solid">
        {Object.values(CATEGORIES).map((category) => (
          <button
            className={`${tabClass} ${category === tab ? activeTabClass : ""}`}
            key={category}
            onClick={() => setTab(category)}
          >
            {category}
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
