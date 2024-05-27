import React, { useContext, useEffect, useMemo } from "react";
import CreditTransactions from "./CreditTransactions";
import { CATEGORIES, CreditContext } from "../../utils/credit";
import CreditChart from "./CreditChart";

export default function CreditTransactionsTab() {
  const { transactions, onCategorize, tab, setTab } = useContext(CreditContext);

  const counts = Object.values(CATEGORIES).map(
    (category) => transactions.filter((t) => t["category"] === category).length,
  );

  const filteredTransactions = tab
    ? transactions.filter((t) => t["category"] === tab)
    : transactions;

  const tabClass = "p-1 font-medium bg-gray-200 hover:bg-gray-400";
  const activeTabClass = "bg-gray-400";

  return (
    <div className="">
      <CreditChart transactions={filteredTransactions} />
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
        transactions={filteredTransactions}
        onCategorize={onCategorize}
      />
    </div>
  );
}
