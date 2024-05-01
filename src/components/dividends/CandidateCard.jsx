import React from "react";

export function CandidateStats({ monthly, total, roi, exp, ratio }) {
  return (
    <div>
      <p>{`${monthly.toFixed(0)}/mo @ ${(total / 1000).toFixed(2)}k`}</p>
      <p>{roi && exp ? `${roi}/${exp}=${ratio}` : ratio}</p>
    </div>
  );
}

export default function CandidateCard({ candidate, stats, children }) {
  // copy values to be pasted into the streadsheet
  const load = async (text) => await navigator.clipboard.writeText(text);
  const onClick = candidate ? () => load(candidate.join("\n")) : undefined;

  return (
    <div
      className="max-w-44 min-w-min select-none bg-gray-100 shadow-md rounded-md p-2 cursor-pointer hover:bg-gray-200"
      onClick={onClick}
    >
      <div>{children}</div>
      <CandidateStats {...stats} />
    </div>
  );
}
