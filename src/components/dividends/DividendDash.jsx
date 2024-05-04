import React, { useContext, useState } from "react";
import CandidateCard from "./CandidateCard";
import RadioSelector from "../RadioSelector";
import {
  REQUIRED_COLS,
  makeRandomCandidate,
  mutateCandidate,
  DividendContext,
  STATS_SORTS,
} from "../../utils/dividends";

export default function DividendDash() {
  const context = useContext(DividendContext);

  const [topCandidates, setTopCandidates] = useState([]);
  const [passingCriteria, setPassingCriteria] = useState({});
  const [isThinking, setIsThinking] = useState(false);
  const [sortOption, setSortOption] = useState("maxRatio"); // TODO: make it a constant

  function makeCandidates(size) {
    if (!context) {
      return;
    }
    // TODO: add STATS_SORTS[sortOption] to context
    const { mins, maxes } = context;

    // TODO: update progress here
    // console.log(`considering ${i}/${SEARCH_SIZE} candidate`);

    let candidates = [];
    for (let i = 0; i < size; i++) {
      const candidate = makeRandomCandidate(mins, maxes);
      candidates = [
        ...candidates,
        candidate,
        mutateCandidate(candidate),
        mutateCandidate(candidate),
        mutateCandidate(candidate),
      ];
      // TODO: mutate a single candidae a few times and add them too
    }
    return candidates;
  }

  // TODO: changing the goal just re-shuffles the candidates
  // NOTE: chart fitness
  const onOptimizeClick = () => {
    const { isPass, getStats } = context;

    const TOP_SIZE = 9;

    // TODO: keep looking (in batches) as long as the objective keeps improving
    // TODO: each iteration must be based on the previous one
    // TODO: this is where backtracking algo would work well

    const passing = makeCandidates(1000).filter(isPass);
    if (passing.length > 0) {
      // NOTE: must be this shape, because we need to sort by stats
      const newTop = passing.map((candidate) => ({
        candidate,
        stats: getStats(candidate),
      }));
      setTopCandidates((prev) =>
        [...new Set([...prev, ...newTop])]
          .sort(STATS_SORTS[sortOption])
          .slice(0, TOP_SIZE),
      );
      // previous best candidates + new candidates resorted, not overwritten
    }
  };

  // TODO: practice doing context here
  /* {false && current && current.length && (
        <>
          <CandidateCard candidate={current} stats={getStats(current)} />
          <h1 className="text-3xl text-gray-600 leading-tight mb-4">
            <CandidateStats {...passingCriteria} />
          </h1>
        </>
      )} */

  return (
    <div className="p-4 flex flex-col items-center">
      <div className="text-sm text-gray-400">
        REQUIRED: {REQUIRED_COLS.join(",")}
      </div>
      <RadioSelector
        options={Object.keys(STATS_SORTS)}
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value)}
      />

      {topCandidates.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-4 text-sm font-mono">
            {topCandidates.map(({ candidate, stats }, index) => (
              <CandidateCard key={index} {...{ candidate, stats }} />
            ))}
          </div>
        </>
      )}

      {Object.keys(context).length > 0 && !isThinking && (
        <button
          className={`text-lg text-white font-bold my-4 p-4 bg-blue-500 hover:bg-blue-700 rounded`}
          onClick={onOptimizeClick}
        >
          Optimize
        </button>
      )}
    </div>
  );
}
