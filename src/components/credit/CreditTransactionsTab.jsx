import React, { useContext } from 'react';
import { CreditContext, COLORS } from '../../utils/credit';
import CategoryTabs from './CategoryTabs';
import CreditChart from './CreditChart';
import CreditTransactions from './CreditTransactions';
import { groupBy, sumBy } from 'lodash';

const options = ['week', 'month']; // must be a prop of transaction

// TODO: two pies, total and average spending per category
// TODO: avg is off because there are 13 unique months between two of the same dates this year and last year
// TODO: it would be nice to sync dataset visibility with tab content
export default function CreditTransactionsTab({ transactions }) {
  const { onCategorize, tab, timeResolution, setTimeResolution } =
    useContext(CreditContext);

  const filtered =
    tab && tab !== 'ALL'
      ? transactions.filter((t) => t['category'] === tab)
      : transactions;

  const groupByKey = tab && tab !== 'ALL' ? 'normalizedName' : 'category';

  // NOTE: categoryTotals is based on transactions not filtered
  const categories = ['ALL', ...Object.keys(COLORS)]; // TODO: these should come from dataset
  const categoryTotals = Object.fromEntries([
    ...Object.entries(groupBy(transactions, 'category')).map(
      ([category, subset]) => [category, sumBy(subset, 'amount')]
    ),
    ['ALL', transactions.reduce((prev, { amount }) => prev + amount, 0)],
  ]);

  // NOTE: tabs are sorted by total, not manual like chart
  categories.sort((a, b) => categoryTotals[b] - categoryTotals[a]); // desc
  // console.log({ categories, categoryTotals })

  return (
    <div className="w-full font-mono text-xs">
      <div className="flex flex-row justify-center space-x-4">
        <div className="flex bg-gray-200 rounded-full p-1">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => setTimeResolution(option)}
              className={`px-4 py-1 rounded-full text-sm font-medium transition-colors duration-300 
              ${timeResolution === option ? 'bg-blue-500 text-white' : 'bg-transparent text-gray-700'}`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <CreditChart
        transactions={filtered}
        timeResolution={timeResolution}
        groupByKey={groupByKey}
      />
      <CategoryTabs categories={categories} categoryTotals={categoryTotals} />
      <CreditTransactions
        title={tab}
        transactions={filtered}
        onCategorize={onCategorize}
      />
    </div>
  );
}
