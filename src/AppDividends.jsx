import React, { useState, useEffect } from "react";

function sumProduct(...arrays) {
  const size = arrays[0].length;

  if (!arrays.every((arr) => arr.length === size)) {
    throw new Error("All arrays must be of the same length");
  }

  let sum = 0;
  for (let i = 0; i < size; i++) {
    let product = 1;
    for (let j = 0; j < arrays.length; j++) {
      product *= parseFloat(arrays[j][i]);
    }
    sum += parseFloat(product.toFixed(32));
  }
  return sum;
}

function makeNewCandidate(mins, maxes) {
  if (mins.length !== maxes.length) {
    throw new Error("Arrays must have the same length");
  }

  // NOTE: includes min and max
  return mins.map((min, index) => {
    const range = maxes[index] - min + 1;
    return Math.floor(Math.random() * range) + min;
  });
}

function mutateCandidate(candidate, jitter = 0.1) {
  return candidate.map((value, index) => {
    const direction = Math.random() < 0.5 ? 1 : -1;
    const magnitude = Math.random() * value * jitter;
    return originalValue + Math.floor(direction * magnitude);
  });
}

function evaluateCandidate(candidate, expenses, dividends, prices) {
  const total = sumProduct(candidate, prices);
  const monthly = sumProduct(candidate, dividends);
  const exp = sumProduct(candidate, prices, expenses) / total;
  const roi = (monthly * 12) / total;
  const ratio = roi / exp; // NOTE: this is what we're trying to maximize

  return {
    total: Math.round(total),
    monthly: Math.round(monthly),
    exp: parseFloat((100 * exp).toFixed(2)),
    roi: parseFloat((100 * roi).toFixed(2)),
    ratio: parseFloat(ratio.toFixed(2)),
  };
}

function formatGoal({ monthly, total }) {
  return `${monthly.toFixed(0)}/mo @ ${(total / 1000).toFixed(2)}k`;
}

/*
console.log(
  evaluateCandidate(
    [300, 50, 70, 80, 300, 220, 210, 90, 90, 70],
    [0.45, 0.55, 0.35, 0.68, 0.6, 0.66, 0.61, 0.3, 0.59, 0.6].map(
      (v) => v / 100, // percent to float
    ),
    [0.11, 0.14, 0.44, 0.14, 0.16, 0.17, 0.22, 0.18, 0.13, 0.31],
    [16.93, 37.94, 55.45, 22.58, 17.28, 16.26, 21.05, 43.23, 19.2, 39.74],
  ),
);
*/

// should be 261
/*
console.log(
  sumProduct(
    [0.11, 0.14, 0.44, 0.14, 0.16, 0.17, 0.22, 0.18, 0.13, 0.31],
    [300, 50, 70, 80, 300, 220, 210, 90, 90, 70],
  ),
);
*/

// google sheets solver has been broken for a while, so this is my own evolutionary solver
export default function AppDividends() {
  const TOP_SIZE = 10; // only show this many top candidates
  const SEARCH_SIZE = 100_000; // consider this many candidates

  const REQUIRED_COLS = [
    "COST",
    "PRICE",
    "NOW",
    "MIN",
    "MAX",
    "EXP",
    "NEXT",
    "PRICE",
  ];

  const [topCandidates, setTopCandidates] = useState([]);
  const [passingCriteria, setPassingCriteria] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  async function parseClipboard() {
    await navigator.clipboard.readText().then(parseCSV).then(optimize);
  }

  async function loadCandidate(candidate) {
    await navigator.clipboard.writeText(candidate.join("\n"));
  }

  const parseCSV = (csv) => {
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

  const getTopCandidates = ({
    mins,
    maxes,
    expenses,
    dividends,
    prices,
    isPass,
  }) => {
    let candidates = [];
    for (let i = 0; i < SEARCH_SIZE; i++) {
      // TODO: mutate top candidates by 10% in either direction
      const candidate = makeNewCandidate(mins, maxes);
      const stats = evaluateCandidate(candidate, expenses, dividends, prices);

      if (isPass(stats)) {
        const payload = { candidate, ...stats };

        if (candidates.length < TOP_SIZE) {
          candidates.push(payload);
        } else {
          // replace the worst candidate if the current candidate has a better ratio
          if (stats.ratio > candidates[candidates.length - 1].ratio) {
            candidates[candidates.length - 1] = payload;
          }
        }
        candidates.sort((a, b) => b.ratio - a.ratio); // descending
      }
    }
    return candidates;
  };

  const optimize = ({ values, totals }) => {
    const goalTotal = parseFloat(totals["COST"]);
    const goalMonthly = parseFloat(totals["PRICE"]);
    setPassingCriteria(formatGoal({ monthly: goalMonthly, total: goalTotal }));

    // const current = values.map((v) => parseInt(v["NOW"]));
    const mins = values.map((v) => parseFloat(v["MIN"]));
    const maxes = values.map((v) => parseFloat(v["MAX"]));
    const expenses = values.map((v) => parseFloat(v["EXP"]) / 100); // expense ratio, percent to float
    const dividends = values.map((v) => parseFloat(v["NEXT"])); // next month's dividend estimate
    const prices = values.map((v) => parseFloat(v["PRICE"]));
    // console.log(evaluateCandidate(current, expenses, dividends, prices));

    setIsThinking(true);

    // schedule this for the next render
    setTimeout(() => {
      // TODO: build some kind of progress bar here
      let candidates = getTopCandidates({
        mins,
        maxes,
        expenses,
        dividends,
        prices,
        isPass: ({ total, monthly }) =>
          total <= goalTotal && monthly >= goalMonthly,
      });
      setTopCandidates(candidates);
      setIsThinking(false);
    }, 0);
  };

  const top = (
    <>
      <div className="text-sm text-gray-300">
        REQUIRED: {REQUIRED_COLS.join(",")}
      </div>
      <h1 className="text-3xl text-gray-600 leading-tight mb-4">
        {passingCriteria}
      </h1>

      <div className="flex flex-wrap justify-between text-sm font-mono w-2/3">
        {topCandidates.map(({ candidate, ...stats }, index) => (
          <div
            className="select-none shadow-md rounded-md py-4 px-2 cursor-pointer hover:bg-gray-200 "
            key={index}
            onClick={() => loadCandidate(candidate)}
          >
            <p>{formatGoal(stats)}</p>
            <p>{`${stats.roi}/${stats.exp}=${stats.ratio}`}</p>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center text-gray-800">
      {topCandidates.length > 0 && top}
      <button
        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${isThinking ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={parseClipboard}
        disabled={isThinking}
      >
        Parse Clipboard
      </button>
    </div>
  );
}
