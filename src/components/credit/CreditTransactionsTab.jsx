import React, { useContext, useState } from 'react';
import { CreditContext } from '../../utils/credit';
import CategoryTabs from './CategoryTabs';
import CreditChart from './CreditChart';
import CreditTransactions from './CreditTransactions';

const options = ['week', 'month']; // must be a prop of transaction

// TODO: two pies, total and average spending per category
// TODO: when tab && tab !== 'ALL' show a stack by vendor (e.g., Safeway vs Costco)
export default function CreditTransactionsTab({ transactions }) {
  const [timeResolution, setTimeResolution] = useState('month'); // TODO: week | month
  const { onCategorize, tab } = useContext(CreditContext);

  const filtered =
    tab && tab !== 'ALL'
      ? transactions.filter((t) => t['category'] === tab)
      : transactions;

  const groupByKey = tab && tab !== 'ALL' ? "name" : "category";

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
      <CreditChart transactions={filtered} timeResolution={timeResolution} groupByKey={groupByKey} />
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
