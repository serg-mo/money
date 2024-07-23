import React from 'react';
import CandidateCard from './CandidateCard';

// TODO: consider charting stats as points on a graph
// TODO: click a data point on the chart to load the candidate
export default function TopCandidates({ candidates }) {
  return (
    <div className="grid grid-cols-3 gap-4 text-sm font-mono">
      {candidates.map((props, index) => (
        <CandidateCard key={index} {...props} />
      ))}
    </div>
  );
}
