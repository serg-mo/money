import React from "react";
import {
  CATEGORIES,
  COLORS,
  formatConfidence,
  getOpacity,
} from "../../utils/credit";

// TODO: scale categories by their respective rule sizes, i.e., many examples - bigger scale
// TODO: consider setting opacity based on the confidences

// overflow-hidden
// bg-red-500 bg-orange-500 bg-amber-500 bg-yellow-500 bg-lime-500 bg-green-500 bg-emerald-500 bg-teal-500 bg-cyan-500 bg-sky-500 bg-blue-500 bg-indigo-500 bg-violet-500 bg-slate-500";

// bg-blue-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transform transition duration-150 ease-in-out active:scale-95"
export default function CategoryPicker({ transaction, onClick }) {
  return (
    <div className="flex flex-row flex-wrap justify-between">
      {Object.entries(COLORS).map(([category, color]) => {
        if (category === CATEGORIES.UNCLASSIFIED) {
          return;
        }

        // TODO: decide on opacity based on
        const isCurrent = transaction["category"] === category;
        const confidence = transaction["confidences"][category];
        const className = `my-1 rounded-md bg-gray-200 hover:bg-gray-400 cursor-pointer p-1 ${isCurrent ? "opacity-100" : "opacity-70"} hover:opacity-100 ${confidence && getOpacity(confidence)}`;

        return (
          <div
            className={className}
            onClick={() => onClick(category)}
            key={category}
            title={formatConfidence(confidence)}
          >
            {category}
          </div>
        );
      })}
    </div>
  );
}
