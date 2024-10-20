import { groupBy, sumBy } from 'lodash';
import React, { useContext, useState } from 'react';
import { CreditContext } from '../../utils/credit';
import CategoryTabs from './CategoryTabs';
import CreditChart from './CreditChart';
import CreditTransactions from './CreditTransactions';

const options = ['week', 'month']; // must be a prop of transaction

// TODO: two pies, total and average spending per category
export default function CreditTransactionsTab({ transactions }) {
  const [x, setX] = useState('month');
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
    <div className="w-full font-mono text-xs">
      <div className="flex flex-row justify-center space-x-4">
        <div className="flex bg-gray-200 rounded-full p-1">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => setX(option)}
              className={`px-4 py-1 rounded-full text-sm font-medium transition-colors duration-300 
              ${x === option ? 'bg-blue-500 text-white' : 'bg-transparent text-gray-700'}`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <CreditChart transactions={filteredTransactions} x={x} />
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
