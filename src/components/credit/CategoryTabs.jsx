import React, { useContext } from "react";
import { CATEGORIES } from "../../utils/credit";
import { CreditContext } from "../../utils/credit";

export default function CategoryTabs() {
  const { tab, setTab } = useContext(CreditContext);

  const tabClass = "p-1 font-medium bg-gray-200 hover:bg-gray-400";
  const activeTabClass = "bg-gray-400";

  const categories = ["ALL", ...Object.values(CATEGORIES)];

  return (
    <div className="text-sm divide-x-1 divide-blue-400 divide-solid">
      {categories.map((category) => (
        <button
          key={category}
          className={`${tabClass} ${category === tab ? activeTabClass : ""}`}
          onClick={() => setTab(category === "ALL" ? undefined : category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
