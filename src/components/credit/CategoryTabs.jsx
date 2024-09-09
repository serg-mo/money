import React, { useContext } from 'react';
import { CATEGORIES, CreditContext } from '../../utils/credit';

export default function CategoryTabs() {
  const { tab, setTab } = useContext(CreditContext);

  const tabClass = 'mx-1 p-1 font-medium bg-gray-200 hover:bg-gray-400 rounded';
  const activeTabClass = 'bg-gray-400';

  const categories = ['ALL', ...Object.values(CATEGORIES)];

  return (
    <div className="flex flex-row justify-center text-sm">
      {categories.map((category) => (
        <button
          key={category}
          className={`${tabClass} ${category === tab ? activeTabClass : ''}`}
          onClick={() => setTab(category === 'ALL' ? undefined : category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
