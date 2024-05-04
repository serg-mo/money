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
import TopCandidates from "./TopCandidates";
import CandidatesChart from "./CandidatesChart";
import { groupBy } from "lodash";

export default function DividendDash() {
  const BATCH_SIZE = 1_000;
  const TOP_SIZE = 30;

  const { current, mins, maxes, isPass, getStats } =
    useContext(DividendContext);

  const [topCandidates, setTopCandidates] = useState([]);
  const [sortOption, setSortOption] = useState("maxRatio"); // TODO: make it a constant

  const makeCandidates = (size) => {
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
  };

  // TODO: changing the goal just re-shuffles the candidates
  // NOTE: chart fitness
  const onOptimizeClick = () => {
    // TODO: keep looking (in batches) as long as the objective keeps improving
    // TODO: each iteration must be based on the previous one
    // TODO: this is where backtracking algo would work well

    const passing = makeCandidates(BATCH_SIZE).filter(isPass); // 10k is too slow
    const toCard = (candidate) => ({
      candidate,
      stats: getStats(candidate),
    });

    if (passing.length > 0) {
      // NOTE: must be this shape, because we need to sort by stats, CandidateCard shape
      const newTop = [...topCandidates, ...passing.map(toCard)]
        .sort(STATS_SORTS[sortOption])
        .slice(0, TOP_SIZE);

      // unique stats -> candidates
      const groups = groupBy(newTop, ({ stats }) => JSON.stringify(stats));

      // TODO: only save a single example from each unique stat
      setTopCandidates(Object.values(groups).map((group) => group[0]));
    }
  };

  /*
        <h1 className="text-3xl text-gray-600 leading-tight mb-4">
          <CandidateStats {...passingCriteria} />
        </h1>
*/

  // TODO: make sure to include the current candidate on the charts
  return (
    <div className="w-1/2 p-4 space-y-3 flex flex-col items-center">
      <div className="text-sm text-gray-300">{REQUIRED_COLS.join(",")}</div>
      <RadioSelector
        options={Object.keys(STATS_SORTS)}
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value)}
      />
      <CandidateCard candidate={current} stats={getStats(current)} />
      <button
        className="text-lg text-white font-bold my-4 p-4 bg-blue-500 hover:bg-blue-700 rounded"
        onClick={onOptimizeClick}
      >
        Optimize
      </button>
      {topCandidates.length > 0 && (
        <>
          {/* <TopCandidates candidates={topCandidates} /> */}
          <CandidatesChart cards={topCandidates} x="total" y="monthly" />
          <CandidatesChart cards={topCandidates} x="exp" y="roi" />
        </>
      )}
    </div>
  );
}
