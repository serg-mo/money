import React, { useContext } from "react";
import Frame from "../Frame";
import CreditTransactions from "./CreditTransactions";
import { CreditContext } from "../../utils/credit";
import CreditChart from "./CreditChart";
import { groupBy, sumBy } from "lodash";
import CategoryTabs from "./CategoryTabs";

// TODO: two pies, total and average spending per category
export default function CreditTransactionsTab() {
  const { transactions, onCategorize, tab } = useContext(CreditContext);

  const categories = groupBy(transactions, (row) => row["category"]);
  const categoryTotals = Object.entries(categories).map(
    ([category, categoryTransactions]) => {
      const total = -1 * sumBy(categoryTransactions, "amount");
      return { category, total, categoryTransactions };
    },
  );
  categoryTotals.sort((a, b) => b.total - a.total); // desc

  const filteredTransactions =
    tab && tab !== "ALL"
      ? transactions.filter((t) => t["category"] === tab)
      : transactions;

  return (
    <div className="">
      <CreditChart transactions={filteredTransactions} />
      <CategoryTabs />
      <CreditTransactions
        title={tab}
        transactions={filteredTransactions}
        onCategorize={onCategorize}
      />
    </div>
  );

  // console.log(
  //   categoryTotals.map(({ category, total }) => ({ category, total })),
  // );

  // TODO: it would be nice to sync dataset visibility with tab content
}
