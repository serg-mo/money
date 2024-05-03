import React, { useState, useEffect } from "react";
import RadioSelector from "../components/RadioSelector";
import CandidateCard, {
  CandidateStats,
} from "../components/dividends/CandidateCard";
import {
  sumProduct,
  makeRandomCandidate,
  mutateCandidate,
  evaluateCandidate,
} from "../utils/dividends";

// TODO: compute delta/buy/sell/total for a given candidate
const sortOptions = {
  maxMonthly: (a, b) => b.stats.monthly - a.stats.monthly, // DESC, highest first
  minTotal: (a, b) => a.stats.total - b.stats.total, // ASC, lowest first
  maxRatio: (a, b) => b.stats.ratio - a.stats.ratio, // DESC, highest first
};

// google sheets solver has been broken for a while, so this is my own evolutionary solver
export default function Dividends() {
  const REQUIRED_COLS = ["EXP", "NEXT", "COST", "PRICE", "NOW", "MIN", "MAX"];

  const [context, setContext] = useState(null); // TODO: make this a real context
  const [topCandidates, setTopCandidates] = useState([]);
  const [currentStats, setCurrentStats] = useState(null);
  const [passingCriteria, setPassingCriteria] = useState({});
  const [isThinking, setIsThinking] = useState(false);
  const [sortOption, setSortOption] = useState("maxRatio"); // TODO: make it a constant

  // NOTE: document must be focuses to read clipboard, so a click is necessary
  async function parseClipboard() {
    setIsThinking(true);

    await navigator.clipboard
      .readText()
      .then(parseCells)
      .then(parseColumns)
      .then(() => setIsThinking(false));
  }

  const parseCells = (csv) => {
    const cells = csv
      .split(/\r?\n/) // rows
      .map((v) => v.split(/\s/).map((v) => v.replace(/[\$,%]/g, ""))); // columns as bare numbers

    const headers = cells[0];
    const lastRow = cells[cells.length - 1];

    // ignore first and last row, i.e., headers and totals
    const values = cells
      .slice(1, -1)
      .map((row) =>
        Object.fromEntries(
          headers.map((header, index) => [header, row[index]]),
        ),
      );

    const totals = Object.fromEntries(
      headers.map((header, index) => [header, lastRow[index]]),
    );
    // console.log({ values, totals });

    return { values, totals };
  };

  const parseColumns = ({ values, totals }) => {
    const goalTotal = parseFloat(totals["COST"]); // does not matter, that's the column goalTotal
    const goalMonthly = parseFloat(totals["PRICE"]);
    // TODO: show these
    const minPercent = parseFloat(totals["MIN"]);
    const maxPercent = parseFloat(totals["MAX"]);

    const current = values.map((v) => parseInt(v["NOW"]));
    const mins = values.map((v) => parseFloat(v["MIN"]));
    const maxes = values.map((v) => parseFloat(v["MAX"]));
    const expenses = values.map((v) => parseFloat(v["EXP"]) / 100); // expense ratio, percent to float
    const dividends = values.map((v) => parseFloat(v["NEXT"])); // next month's dividend estimate
    const prices = values.map((v) => parseFloat(v["PRICE"]));

    const getStats = (candidate) =>
      evaluateCandidate(candidate, expenses, dividends, prices);

    const isPass = ({ total, monthly, ratio }) =>
      total <= goalTotal && monthly >= goalMonthly;

    setCurrentStats(getStats(current));
    setPassingCriteria({ total: goalTotal, monthly: goalMonthly });

    setContext({
      mins,
      maxes,
      getStats,
      isPass,
    });
  };

  function initializeCandidates(size = 1000_000) {
    if (!context) {
      return;
    }
    // TODO: add sortOptions[sortOption] to context
    const { mins, maxes, getStats, isPass } = context;

    // TODO: update progress here
    // console.log(`considering ${i}/${SEARCH_SIZE} candidate`);

    let candidates = [];
    for (let i = 0; i < size; i++) {
      const candidate = makeRandomCandidate(mins, maxes);
      const stats = getStats(candidate);
      candidates.push({ candidate, stats });
    }

    return candidates
      .filter(({ stats }) => isPass(stats))
      .sort(sortOptions[sortOption]);
  }

  function mutateCandidates(candidates) {
    const MUTATE_JITTER = 0.1;

    const { getStats, isPass } = context;

    // TODO: refactor, this part is redundand candidates.push(getPassingMutations())
    // TODO: mutate, then filter, then sort, then chop
    return candidates
      .map((candidate) => {
        const mutatedCandidate = mutateCandidate(candidate, MUTATE_JITTER);
        const mutatedStats = getStats(mutatedCandidate);
        //console.log([candidate.join(","), mutatedCandidate.join(",")]);
        return {
          candidate: mutatedCandidate,
          stats: mutatedStats,
        };
      })
      .filter(({ stats }) => isPass(stats))
      .sort(sortOptions[sortOption]);
  }

  // TODO: changing the goal just re-shuffles the candidates
  //useEffect(initializeCandidates, [sortOption]);

  // NOTE: chart fitness
  const optimize = () => {
    const TOP_SIZE = 9;

    // TODO: keep looking (in batches) as long as the objective keeps improving
    // TODO: start with a hardcoded for loop

    // TODO: each iteration must be based on the previous one
    let evaluations = initializeCandidates();
    const fitnesses = [evaluations[0].stats.ratio];
    setTopCandidates(evaluations.slice(0, TOP_SIZE));
    console.log(`Initial Fitness: ${fitnesses[0]}`);

    // TODO: this is where backtracking algo would work well
    // TODO: sometimes the mutations are not better than originals
    /*
    for (let i = 1; i < 1; i++) {
      evaluations = mutateCandidates(
        evaluations.map(({ candidate }) => candidate),
      );
      fitnesses[i] = evaluations[0].stats.ratio;
      console.log(`Fitness ${i}: ${fitnesses[i]}`);

      const delta = Math.round((fitnesses[i] - fitnesses[i - 1]) * 1000) / 1000;
      console.log(`Delta: ${delta}`);
      if (delta == 0) {
        console.log(`Quitting because delta is small`);
        setTopCandidates(evaluations);
        break;
      }

      // TODO: chart this
      // TODO: compare the current fitness to the previous one, quit if not making progress
    }
    */
  };

  // TODO: trigger button/file input should look the same
  // TODO: continuously evaluate candidates in batches of 10
  // TODO: chart current batch candidate performance
  // TODO: do not show the parse button if clipboard is empty
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-sm text-gray-400">
        REQUIRED: {REQUIRED_COLS.join(",")}
      </div>

      <RadioSelector
        options={Object.keys(sortOptions)}
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value)}
      />

      {currentStats && (
        <>
          <CandidateCard stats={currentStats}>Current</CandidateCard>
          <h1 className="text-3xl text-gray-600 leading-tight mb-4">
            <CandidateStats {...passingCriteria} />
          </h1>
        </>
      )}

      {topCandidates.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-4 text-sm font-mono">
            {topCandidates.map((payload, index) => (
              <CandidateCard key={index} {...payload} />
            ))}
          </div>
        </>
      )}
      {!isThinking && !context && (
        <button
          className={`text-lg text-white font-bold my-4 p-4 bg-blue-500 hover:bg-blue-700 rounded`}
          onClick={parseClipboard}
        >
          Parse
        </button>
      )}

      {!!context && !isThinking && (
        <button
          className={`text-lg text-white font-bold my-4 p-4 bg-blue-500 hover:bg-blue-700 rounded`}
          onClick={optimize}
        >
          Optimize
        </button>
      )}
    </div>
  );
}
