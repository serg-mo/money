import React from "react";
import { COLORS, parseName, formatAmount } from "../utils";

// TODO: move the category picker into its own file
// TODO: maybe show categories vertically + animate their appearance disappearance

function CategoryPicker({ onClick }) {
  // bg-red-500 bg-orange-500 bg-amber-500 bg-yellow-500 bg-lime-500 bg-green-500 bg-emerald-500 bg-teal-500 bg-cyan-500 bg-sky-500 bg-blue-500 bg-indigo-500 bg-violet-500 bg-slate-500";

  return (
    <div className="space-y-1 hidden group-hover:block">
      {Object.entries(COLORS).map(([category, color]) => (
        <div
          className={`rounded-full bg-${color}-500 p-1 text-center opacity-50 hover:opacity-100`}
          onClick={() => onClick(category)}
          key={category}
        >
          {category}
        </div>
      ))}
    </div>
  );
}

export default function Transaction({ onClick, ...t }) {
  const handleCategory = (category) => onClick(parseName(t["Name"]), category);

  return (
    <tr className="group">
      <td>{t["Name"]}</td>
      <td>${formatAmount(t["Amount"])}</td>
      <td>
        <div>{t["Category"]}</div>
        <CategoryPicker onClick={handleCategory} />
      </td>
    </tr>
  );
}
