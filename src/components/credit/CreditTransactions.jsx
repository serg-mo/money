import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';
import React, { useMemo, useState } from 'react';
import CreditTransaction from './CreditTransaction';

export default function CreditTransactions({
  title,
  transactions,
  onCategorize,
}) {
  const columnsWidths = {
    name: '',
    location: 'w-64',
    date: 'w-24',
    amount: 'w-12',
    category: 'w-36',
    confidence: 'w-12',
  };

  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc',
  });

  const sortByKey = (key, direction) => (a, b) => {
    if (a[key] < b[key]) {
      return direction === 'asc' ? -1 : 1;
    }
    if (a[key] > b[key]) {
      return direction === 'asc' ? 1 : -1;
    }
    return 0;
  };

  const sortedTransactions = useMemo(() => {
    if (sortConfig.key) {
      return [...transactions].sort(
        sortByKey(sortConfig.key, sortConfig.direction)
      );
    }
    return transactions;
  }, [transactions, sortConfig]);

  const getChevron = (direction) =>
    direction === 'asc' ? (
      <ChevronUpIcon className="inline w-4 h-4 ml-1" />
    ) : (
      <ChevronDownIcon className="inline w-4 h-4 ml-1" />
    );

  const total = transactions.reduce((sum, { amount }) => sum + amount, 0);

  if (!transactions.length) {
    return;
  }

  return (
    <table className="mx-auto my-2 border-collapse border border-slate-600">
      <thead>
        <tr>
          <th colSpan={Object.keys(columnsWidths).length} className="uppercase">
            <div className="flex flex-row justify-center space-x-4">
              <div>{title ?? 'All'}</div>
              <div>Count {transactions.length}</div>
              <div>Total ${Math.round(total).toLocaleString()}</div>
              <div>
                Avg ${Math.round(total / transactions.length).toLocaleString()}
              </div>
            </div>
          </th>
        </tr>
        <tr>
          {Object.entries(columnsWidths).map(([column, width]) => (
            <th
              key={column}
              className={`border border-slate-600 cursor-pointer ${width}`}
              onClick={() =>
                setSortConfig({
                  key: column,
                  direction: sortConfig.direction === 'asc' ? 'desc' : 'asc', // toggle
                })
              }
            >
              {column.toUpperCase()}
              {sortConfig.key === column && getChevron()}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedTransactions.map((transaction, key) => (
          <CreditTransaction
            key={key}
            {...transaction}
            onClick={(category) => onCategorize(transaction, category)}
          />
        ))}
      </tbody>
    </table>
  );
}
