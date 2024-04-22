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
  return candidate.map((value) => {
    const direction = Math.random() < 0.5 ? 1 : -1;
    const magnitude = Math.random() * jitter;
    return parseInt(value * (1 + direction * magnitude));
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

function formatGoal({ monthly, total, roi, exp, ratio }) {
  return (
    <>
      <p>{`${monthly.toFixed(0)}/mo @ ${(total / 1000).toFixed(2)}k`}</p>
      <p>{`${roi}/${exp}=${ratio}`}</p>
    </>
  );
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
  const TOP_SIZE = 9;
  const SEARCH_SIZE = 100_000;
  const MUTATE_SIZE = 5;

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

  const getTopCandidates = ({ mins, maxes, getStats, isPass }) => {
    let candidates = [];
    for (let i = 0; i < SEARCH_SIZE; i++) {
      const candidate = makeNewCandidate(mins, maxes);
      const stats = getStats(candidate);
      if (isPass(stats)) {
        // do not add the original candidate, mutate it first
        for (let j = 0; j < MUTATE_SIZE; j++) {
          const mutatedCandidate = mutateCandidate(candidate);
          const mutatedStats = getStats(mutatedCandidate);
          //console.log([candidate.join(","), mutatedCandidate.join(",")]);

          if (isPass(mutatedStats)) {
            candidates.push({
              candidate: mutatedCandidate,
              stats: mutatedStats,
            });
          }
        }
      }
    }

    console.log(`${candidates.length} candidates to sort`);

    let top = [];
    for (const payload of candidates) {
      if (top.length < TOP_SIZE) {
        top.push(payload);
      } else {
        // replace the worst candidate if the current candidate has a better ratio
        if (payload.stats.ratio > top[top.length - 1].stats.ratio) {
          top[top.length - 1] = payload;
        }
      }
      top.sort((a, b) => b.stats.ratio - a.stats.ratio); // descending, best -> worst ratio
    }

    return top;
  };

  const optimize = ({ values, totals }) => {
    const goalTotal = parseFloat(totals["COST"]);
    const goalMonthly = parseFloat(totals["PRICE"]);

    const mins = values.map((v) => parseFloat(v["MIN"]));
    const maxes = values.map((v) => parseFloat(v["MAX"]));
    const expenses = values.map((v) => parseFloat(v["EXP"]) / 100); // expense ratio, percent to float
    const dividends = values.map((v) => parseFloat(v["NEXT"])); // next month's dividend estimate
    const prices = values.map((v) => parseFloat(v["PRICE"]));

    const current = values.map((v) => parseInt(v["NOW"]));
    const currentStats = evaluateCandidate(
      current,
      expenses,
      dividends,
      prices,
    );
    setPassingCriteria(formatGoal(currentStats));
    setIsThinking(true);

    // schedule this for the next render
    setTimeout(() => {
      // TODO: build some kind of progress bar here
      let candidates = getTopCandidates({
        mins,
        maxes,
        getStats: (candidate) =>
          evaluateCandidate(candidate, expenses, dividends, prices),
        isPass: ({ total, monthly, ratio }) =>
          total <= goalTotal &&
          monthly >= goalMonthly &&
          ratio >= currentStats.ratio,
      });
      setTopCandidates(candidates);
      setIsThinking(false);
    }, 0);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center text-gray-800">
      {topCandidates.length > 0 ? (
        <>
          <div className="text-sm text-gray-400">
            REQUIRED: {REQUIRED_COLS.join(",")}
          </div>
          <h1 className="text-3xl text-gray-600 leading-tight mb-4">
            {passingCriteria}
          </h1>

          <div className="grid grid-cols-3 gap-4 text-sm font-mono">
            {topCandidates.map(({ candidate, stats }, index) => (
              <div
                className="max-w-44 min-w-min select-none bg-gray-100 shadow-md rounded-md py-6 px-2 cursor-pointer hover:bg-gray-200 "
                key={index}
                onClick={() => loadCandidate(candidate)}
              >
                {formatGoal(stats)}
              </div>
            ))}
          </div>
        </>
      ) : (
        <button
          className={`text-lg text-white font-bold my-4 p-4 bg-blue-500 hover:bg-blue-700 rounded ${isThinking ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={parseClipboard}
          disabled={isThinking}
        >
          Parse Clipboard
        </button>
      )}
    </div>
  );
}
