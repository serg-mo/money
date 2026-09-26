import React, { useContext } from 'react';
import { CreditContext } from '../../utils/credit';

export default function CategoryTabs({ categories, categoryTotals }) {
  const { tab, setTab } = useContext(CreditContext);

  const tabClass = 'mx-1 p-1 font-medium bg-gray-200 hover:bg-gray-400 rounded';
  const activeTabClass = 'bg-gray-400';

  // NOTE: categories are sorted, which is why they have to be separate from totals
  return (
    <div className="flex flex-row justify-center text-sm">
      {categories.map((category) => (
        <button
          key={category}
          className={`${tabClass} ${category === tab ? activeTabClass : ''}`}
          onClick={() => setTab(category === 'ALL' ? undefined : category)}
        >
          {[
            category,
            categoryTotals[category] ? Math.round(categoryTotals[category] / 1000) + 'k' : null
          ].filter(Boolean).join(' ')}
        </button>
      ))}
    </div>
  );
}
