import { groupBy, sumBy } from 'lodash';
import React, { useContext } from 'react';
import { CreditContext } from '../../utils/credit';
import CategoryTabs from './CategoryTabs';
import CreditChart from './CreditChart';
import CreditTransactions from './CreditTransactions';

// TODO: two pies, total and average spending per category
export default function CreditTransactionsTab({ transactions }) {
  const { onCategorize, tab } = useContext(CreditContext);

  const categories = groupBy(transactions, (row) => row['category']);
  const categoryTotals = Object.entries(categories).map(
    ([category, categoryTransactions]) => {
      const total = -1 * sumBy(categoryTransactions, 'amount');
      return { category, total, categoryTransactions };
    }
  );
  categoryTotals.sort((a, b) => b.total - a.total); // desc

  const filteredTransactions =
    tab && tab !== 'ALL'
      ? transactions.filter((t) => t['category'] === tab)
      : transactions;

  return (
    <div className="w-3/4 font-mono text-xs">
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
