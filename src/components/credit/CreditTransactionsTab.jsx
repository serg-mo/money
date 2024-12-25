import { groupBy, sumBy } from 'lodash';
import React, { useContext, useState } from 'react';
import { BUDGET_BARE, BUDGET_MONTHLY, BUDGET_TOTAL, CreditContext } from '../../utils/credit';
import CategoryTabs from './CategoryTabs';
import CreditChart from './CreditChart';
import CreditTransactions from './CreditTransactions';

const options = ['week', 'month']; // must be a prop of transaction

const makeAnnotation = (name, value) => ({
  type: 'line',
  mode: 'horizontal',
  scaleID: 'y',
  label: {
    content: `${name}: ${value}`,
    display: true,
    position: 'start',
  },
  value: value,
  borderColor: 'red', // COLORS[tab] || 'blue',
  borderWidth: 2,
});

// budgets are monthly by default, convert to weekly
const convertBudget = (value, type) =>
  type === 'month' ? value : Math.round((value * 12) / 52);

// TODO: two pies, total and average spending per category
export default function CreditTransactionsTab({ transactions }) {
  const [x, setX] = useState('month'); // TODO: week | month
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

  const annotations =
    tab && tab !== 'ALL'
      ? [makeAnnotation('BUDGET', convertBudget(BUDGET_MONTHLY[tab], x))]
      : [
        makeAnnotation('TOTAL', convertBudget(BUDGET_TOTAL, x)),
        makeAnnotation('BARE', convertBudget(BUDGET_BARE, x)),
      ];

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
      <CreditChart
        transactions={filteredTransactions}
        x={x}
        annotations={annotations}
      />
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
