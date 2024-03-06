import React from "react";
import { COLORS, parseName, formatAmount } from "../utils";

// TODO: move the category picker into its own file
// TODO: maybe show categories vertically + animate their appearance disappearance

function CategoryPicker({ current, onClick }) {
  // bg-red-500 bg-orange-500 bg-amber-500 bg-yellow-500 bg-lime-500 bg-green-500 bg-emerald-500 bg-teal-500 bg-cyan-500 bg-sky-500 bg-blue-500 bg-indigo-500 bg-violet-500 bg-slate-500";
  return (
    <div className="flex flex-row overflow-hidden transition-all ease-in-out duration-500">
      {Object.entries(COLORS).map(([category, color]) => (
        <div
          className={`bg-slate-500 cursor-pointer p-1 ${current === category ? "opacity-100" : "opacity-50"} hover:opacity-100`}
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
  const handleCategory = (category) => onClick(parseName(t["name"]), category);

  return (
    <tr className="group hover:border-2 border-black">
      <td>
        <div>{t["name"]}</div>
        <div className="hidden group-hover:block">
          {onClick && (
            <CategoryPicker current={t["category"]} onClick={handleCategory} />
          )}
        </div>
      </td>
      <td>${formatAmount(t["amount"])}</td>
      <td>{t["category"]}</td>
    </tr>
  );
}
