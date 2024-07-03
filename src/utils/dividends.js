import { createContext } from "react";
import { parseCSV, rowToObjectWithKeys } from "./common";
export const DividendContext = createContext();
import moment from "moment";
import regression from "regression";

export const HEADER_ROW_INDEX = 0;
export const REQUIRED_COLS = ["symbol", "quantity", "average cost basis"];

// NOTE: this only works with a specific shape
export const CARD_SORTS = {
  maxMonthly: (a, b) => b.stats.monthly - a.stats.monthly, // DESC, highest first
  minTotal: (a, b) => a.stats.total - b.stats.total, // ASC, lowest first
  minCost: (a, b) => a.stats.cost - b.stats.cost, // ASC, lowest first
  maxRatio: (a, b) => b.stats.ratio - a.stats.ratio, // DESC, highest first
  maxRoi: (a, b) => b.stats.roi - a.stats.roi, // DESC, highest first
};

export async function parseDividendFile(txt) {
  const cells = parseCSV(txt);
  const headers = cells[0];
  // console.log({ cells, headers });

  const objectify = rowToObjectWithKeys(headers);
  // TODO: this should be synchronized with "scripts/fetch_dividends"
  const values = cells
    .slice(1, 13)
    .map(objectify)
    .filter((v) => !!v["quantity"] && v["symbol"] !== "FZROX"); // ignore header/footer
  // console.log({ values });

  const names = values.map((v) => v["symbol"]);
  const current = values.map((v) => parseInt(v["quantity"]));
  const basis = values.map((v) => parseFloat(v["average cost basis"]));
  // console.log({ names, current });

  const stats = await Promise.all(names.map(lookupDividends));
  // console.log({ stats });

  const expenses = stats.map((v) => v.expenseRatio);
  const dividends = stats.map((v) => v.dividends);
  const prices = stats.map((v) => v.price);
  // console.log({ expenses, dividends, prices });

  return {
    names,
    prices,
    basis,
    dividends,
    current,
    goalTotal: 45_000, // see dividends model
    goalMonthly: 355, // see dividends model
    getStats: (c) =>
      evaluateCandidate(c, { expenses, dividends, prices, current }),
  };
}

export function singleArrayProduct(arr) {
  return arr.reduce((acc, val) => acc * val, 1);
}

export function arrayProduct(...arrays) {
  const size = arrays[0].length;

  if (!arrays.every((arr) => arr.length === size)) {
    throw new Error("All arrays must be of the same length");
  }

  let result = [];
  for (let i = 0; i < size; i++) {
    result.push(singleArrayProduct(arrays.map((arr) => arr[i])));
  }
  return result;
}

export function arrayDifference(a, b) {
  if (a.length !== b.length) {
    throw new Error("Arrays must be of the same length");
  }

  return a.map((value, index) => value - b[index]);
}

export function arraySum(arr) {
  return arr.reduce((accumulator, current) => accumulator + current, 0);
}

export function sumProduct(...arrays) {
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

// assert all values are positive, not originals, and are multiples of 10
// console.log(mutateCandidate([300, 50, 70, 80, 300, 220, 210, 90, 90, 70]));
export function mutateCandidate(candidate, jitter, multiple = 10) {
  return [...candidate.map((value) => mutateValue(value, jitter, multiple))]; // new array instance
}

console.assert(mutateValue(300) !== 300, "mutateValue");
export function mutateValue(value, jitter, multiple) {
  const direction = Math.random() < 0.5 ? 1 : -1;
  const magnitude = Math.floor(Math.random() * jitter * value);
  const newValue = value + (direction * magnitude);

  return multipleOfN(Math.max(0, newValue), multiple); // positive values only
}

export function multipleOfN(value, n) {
  return Math.round(value / n) * n;
}

export function evaluateCandidate(
  candidate,
  { expenses, dividends, prices, current },
) {
  const total = sumProduct(candidate, prices); // total value of the portfolio
  const monthly = sumProduct(candidate, dividends.map((d) => d.next)); // last, avg, next
  const exp = sumProduct(candidate, prices, expenses) / total;
  const roi = (monthly * 12) / total; // a year worth of dividends over the total invested
  const ratio = roi / exp; // NOTE: this is what we're trying to maximize

  const delta = candidate.map((value, index) => value - current[index]);
  const cost = sumProduct(delta, prices); // only some orders are executable

  return {
    total: Math.round(total),
    monthly: Math.round(monthly),
    cost: Math.round(cost), // cost of executable transactions that move current to candidate
    exp: parseFloat((100 * exp).toFixed(2)), // percent
    roi: parseFloat((100 * roi).toFixed(2)), // percent
    ratio: parseFloat(ratio.toFixed(2)),
  };
}

export function makeCandidates(src, size, jitter) {
  let candidates = [];
  for (let i = 0; i < size; i++) {
    const candidate = mutateCandidate(src, jitter);
    candidates.push(candidate);
  }
  return candidates;
}



// console.log(candidateCombinations([100, 200], [10])); // [[110, 200], [100, 210]]
// console.log(candidateCombinations([100, 200], [-10, 10])); // [[90, 200], [110, 200], [100, 190], [100, 210]]
export function singleCandidateCombinations(candidate, variants) {
  // modify one fund at a time for each variant
  return candidate.flatMap((_num, index) =>
    variants.map((variant) => {
      const newCandidate = candidate.slice(); // copy
      newCandidate[index] += variant;
      return newCandidate;
    }),
  );
}

// TODO: check that prop is keyof typeof card.stats
export function deDupeCardsByStat(cards, prop) {
  const seen = new Set();
  return cards.filter((card) => {
    const key = card.stats[prop];
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function getUnitDistanceOnStat(a, b, stat) {
  return a.stats[stat] - b.stats[stat];
}

export function getPercentDistanceOnStat(a, b, stat) {
  return getUnitDistanceOnStat(a, b, stat) / b.stats[stat];
}

function isCloseStats(a, b, totalMargin = 0, monthlyMargin = 0) {
  // either total OR monthly are within unit margin
  return (
    Math.abs(getUnitDistanceOnStat(a, b, "total")) < totalMargin ||
    Math.abs(getUnitDistanceOnStat(a, b, "monthly")) < monthlyMargin
  );
}

export function isBetterStats(a, b) {
  // both less total AND more monthly
  return (
    getUnitDistanceOnStat(a, b, "total") < 0 &&
    getUnitDistanceOnStat(a, b, "monthly") > 0
  );
}

export function isCloseToCard(focusCard, totalMargin, monthlyMargin) {
  return (card) => isCloseStats(card, focusCard, totalMargin, monthlyMargin);
}

export function isBetterThanCard(focusCard) {
  return (card) => isBetterStats(card, focusCard);
}
/*
// TODO: convert these to assertions
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

export function dfs(current, best, isBetterThan, prices) {
  const dfsInner = (c, b, index) => {
    console.log({ c, b, index });
    // if we have considered all funds, check if the c solution is better
    if (index >= prices.length) {
      if (isBetterThan(c, b)) {
        b = [...c];
      }
      return;
    }

    const original = c[index];

    // consider increments of 10 shares for the c fund
    for (let shares = 0; shares <= 30; shares += 10) {
      c[index] = shares;

      // recurse to the next fund
      dfsInner(c, b, index + 1);
    }

    c[index] = original;
  };
  return dfsInner(current, best, 0);
}

export function sum(arr) {
  return arr.reduce((acc, val) => acc + val, 0);
}

export function mean(arr) {
  return sum(arr) / arr.length;
}

export async function lookupDividends(symbol) {
  const response = await fetch(`/dividends/${symbol}.json`);
  const {
    dividends,
    expense_ratio: expenseRatio,
    price,
  } = await response.json();

  const oneYearAgo = moment().subtract(1, "years").unix();
  const filterFN = ([date]) => moment(date).unix() >= oneYearAgo;

  // exercise date, dividend in dollars
  const indexed = dividends
    .filter(filterFN)
    .reverse()
    .map(([date, amount], index) => [index + 1, amount]);

  // TODO: tune the predictor + chart the guess
  //'linear', 'exponential', 'logarithmic', 'power', 'polynomial',
  const options = { order: 3, precision: 3 };
  const result = regression.linear(indexed, options);
  const next = result.predict(indexed.length + 1)[1].toFixed(4); // [x, y]

  const values = indexed.map(([x, y]) => y);
  const last = values[0].toFixed(4); // first y is the most recent dividend
  const avg = mean(values).toFixed(4);

  return {
    dividends: { last, avg, next },
    price,
    expenseRatio,
    yield: sum(values) / price,
  };
}

// should be 261
/*
console.log(
  sumProduct(
    [0.11, 0.14, 0.44, 0.14, 0.16, 0.17, 0.22, 0.18, 0.13, 0.31],
    [300, 50, 70, 80, 300, 220, 210, 90, 90, 70],
  ),
);
*/
