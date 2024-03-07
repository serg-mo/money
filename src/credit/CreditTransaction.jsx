import React from "react";
import { CATEGORIES, COLORS, parseName, formatAmount } from "../utils";
import moment from "moment";

// TODO: move the category picker into its own file
// TODO: maybe show categories vertically + animate their appearance disappearance

// overflow-hidden
// bg-red-500 bg-orange-500 bg-amber-500 bg-yellow-500 bg-lime-500 bg-green-500 bg-emerald-500 bg-teal-500 bg-cyan-500 bg-sky-500 bg-blue-500 bg-indigo-500 bg-violet-500 bg-slate-500";
function CategoryPicker({ current, onClick }) {
  return (
    <div className="flex flex-row flex-wrap justify-between">
      {Object.entries(COLORS).map(([category, color]) => {
        if (category === CATEGORIES.UNCLASSIFIED) {
          return;
        }

        const className = `rounded-md bg-slate-500 cursor-pointer p-1 m-1 ${current === category ? "opacity-100" : "opacity-70"} hover:opacity-100`;

        return (
          <div
            className={className}
            onClick={() => onClick(category)}
            key={category}
          >
            {category}
          </div>
        );
      })}
    </div>
  );
}

export default function Transaction({ onClick, ...t }) {
  const handleCategory = (category) => onClick(parseName(t["name"]), category);

  return (
    <tr className="group border border-slate-600">
      <td className="p-2 align-middle">{t["name"].substring(0, 23).trim()}</td>
      <td className="p-2 text-center">
        <div className="block group-hover:hidden">
          {t["name"].substring(23).trim()}
        </div>
        <div className="hidden group-hover:block">
          {onClick && (
            <CategoryPicker current={t["category"]} onClick={handleCategory} />
          )}
        </div>
      </td>
      <td className="p-2 text-center">
        {moment(t["date"]).format("YYYY-MM-DD")}
      </td>
      <td className="p-2 text-center">${formatAmount(t["amount"])}</td>
      <td className="p-2 text-center">{t["category"]}</td>
    </tr>
  );
}
