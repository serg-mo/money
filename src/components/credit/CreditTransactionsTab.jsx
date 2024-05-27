import React, { useContext, useEffect, useMemo } from "react";
import CreditTransactions from "./CreditTransactions";
import { CATEGORIES, CreditContext } from "../../utils/credit";
import CreditChart from "./CreditChart";
import { groupBy, sumBy } from "lodash";

// TODO: two pies, total and average spending per category
export default function CreditTransactionsTab() {
  const { transactions, onCategorize, tab, setTab } = useContext(CreditContext);

  const categories = groupBy(transactions, (row) => row["category"]);
  const categoryTotals = Object.entries(categories).map(
    ([category, categoryTransactions]) => {
      const total = -1 * sumBy(categoryTransactions, "amount");
      return { category, total, categoryTransactions };
    },
  );
  categoryTotals.sort((a, b) => b.total - a.total); // desc

  const filteredTransactions = tab
    ? transactions.filter((t) => t["category"] === tab)
    : transactions;

  const tabClass = "p-1 font-medium bg-gray-200 hover:bg-gray-400";
  const activeTabClass = "bg-gray-400";

  // console.log(
  //   categoryTotals.map(({ category, total }) => ({ category, total })),
  // );

  // TODO: it would be nice to sync dataset visibility with tab content
  return (
    <div className="">
      <CreditChart transactions={filteredTransactions} />
      <div className="text-sm divide-x-1 divide-blue-400 divide-solid">
        {categoryTotals.map(({ category }) => (
          <button
            key={category}
            className={`${tabClass} ${category === tab ? activeTabClass : ""}`}
            onClick={() => setTab(category)}
          >
            {category}
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
