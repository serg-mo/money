import React, { useContext } from 'react';
import { COLORS, CreditContext } from '../../utils/credit';

export default function CategoryTabs() {
  const { tab, setTab } = useContext(CreditContext);

  const tabClass = 'mx-1 p-1 font-medium bg-gray-200 hover:bg-gray-400 rounded';
  const activeTabClass = 'bg-gray-400';

  // TODO: this should depend on existing classifications
  const categories = ['ALL', ...Object.keys(COLORS)];

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
