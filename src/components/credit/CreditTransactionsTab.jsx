import React, { useContext } from 'react';
import { CreditContext } from '../../utils/credit';
import CategoryTabs from './CategoryTabs';
import CreditChart from './CreditChart';
import CreditTransactions from './CreditTransactions';

const options = ['week', 'month']; // must be a prop of transaction

// TODO: two pies, total and average spending per category
// TODO: avg is off because there are 13 unique months between two of the same dates this year and last year
export default function CreditTransactionsTab({ transactions }) {
  const { onCategorize, tab, timeResolution, setTimeResolution } = useContext(CreditContext);

  const filtered =
    tab && tab !== 'ALL'
      ? transactions.filter((t) => t['category'] === tab)
      : transactions;

  const groupByKey = tab && tab !== 'ALL' ? 'normalizedName' : 'category';

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
      <CategoryTabs />
      <CreditTransactions
        title={tab}
        transactions={filtered}
        onCategorize={onCategorize}
      />
    </div>
  );

  // TODO: it would be nice to sync dataset visibility with tab content
}
