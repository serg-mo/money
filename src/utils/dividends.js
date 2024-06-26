import { createContext } from "react";
import { splitCells, rowToObjectWithKeys } from "./common";
export const DividendContext = createContext();
import moment from "moment";
import regression from "regression";

export const REQUIRED_COLS = ["NAME", "COST", "NOW"];

// NOTE: this only works with a specific shape
export const CARD_SORTS = {
  maxMonthly: (a, b) => b.stats.monthly - a.stats.monthly, // DESC, highest first
  minTotal: (a, b) => a.stats.total - b.stats.total, // ASC, lowest first
  minCost: (a, b) => a.stats.cost - b.stats.cost, // ASC, lowest first
  maxRatio: (a, b) => b.stats.ratio - a.stats.ratio, // DESC, highest first
  maxRoi: (a, b) => b.stats.roi - a.stats.roi, // DESC, highest first
};

export async function parseDividendFile(txt) {
  // only look at the first few columns, because headers repeat, e.g., weight
  const cells = splitCells(txt).map((row) => row.slice(0, 9));

  // 0 - header, 1-10 funds, 11 - footer
  const [headers, footers] = [cells[0], cells[11]];
  //console.log({ cells, headers, footers });

  if (!REQUIRED_COLS.every((col) => headers.includes(col))) {
    throw new Error("Missing required columns: " + REQUIRED_COLS.join(", "));
  }

  const objectify = rowToObjectWithKeys(headers);
  const values = cells.slice(1, 11).map(objectify); // ignore header/footer
  const totals = objectify(footers);
  // console.log({ values, totals });

  const goalTotal = parseFloat(totals["COST"]); // name of the column where goalTotal lives
  const goalMonthly = parseFloat(totals["NOW"]); // name of the column where goalMonthly lives
  // console.log({ goalTotal, goalMonthly });

  // TODO: these come from CSV
  const names = values.map((v) => v["NAME"]);
  const current = values.map((v) => parseInt(v["NOW"]));
  const oks = values.map((v) => v["OK"] === "TRUE" ? 1 : 0);
  // console.log(oks)

  const stats = await Promise.all(
    values.map((v) => lookupDividends(v["NAME"])),
  );
  // console.log({ stats });
  
  const expenses = stats.map((v) => v.expenseRatio);
  const dividends = stats.map((v) => v.avg.toFixed(4)); // TODO: tune the predictor + chart the guess
  const prices = stats.map((v) => v.price);
  // console.log({ expenses, dividends, prices });
 
  return {
    names,
    prices,
    dividends,
    oks,
    current,
    goalTotal,
    goalMonthly,
    getStats: (c) => evaluateCandidate(c, { expenses, dividends, prices, current, oks })
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
    throw new Error("Arrays must be of the same length")
  }

  return a.map((value, index) => value - b[index]);
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

console.assert(mutateValueRange(300) !== 300, "mutateValueRange");
export function mutateValueRange(value, jitter = 0.1, multiple = 10) {
  const [min, max] = [value - jitter * value, value + jitter * value];
  const range = max - min + 1;
  const next = Math.floor(Math.random() * range) + min;
  return Math.round(next / multiple) * multiple;
}

export function mutateCandidates(candidates) {
  return candidates.map(mutateCandidate);
}

// console.log(mutateCandidate([300, 50, 70, 80, 300, 220, 210, 90, 90, 70]));
export function mutateCandidate(candidate, jitter, multiple = 10) {
  const mutate = (value) => mutateValue(value, jitter, multiple);
  return [...candidate.map(mutate)]; // new array instance
}

// TODO: figure out mutation strategy
// console.assert(mutateValue(300) !== 300, "mutateValue");
// TODO: positive values only, but somehow I get negatives
export function mutateValue(value, jitter, multiple) {
  const direction = Math.random() < 0.5 ? 1 : -1;
  const magnitude = Math.floor(Math.random() * jitter * value);
  return Math.round((value + direction * magnitude) / multiple) * multiple;
  //return Math.round(value + direction * magnitude);
}

export function evaluateCandidate(candidate, { expenses, dividends, prices, current, oks }) {
  
  const total = sumProduct(candidate, prices);
  const monthly = sumProduct(candidate, dividends);
  const exp = sumProduct(candidate, prices, expenses) / total;
  const roi = (monthly * 12) / total;
  const ratio = roi / exp; // NOTE: this is what we're trying to maximize

  const delta = candidate.map((value, index) => value - current[index]);
  const cost = sumProduct(delta, oks, prices); // only some orders are executable

  return {
    total: Math.round(total),
    monthly: Math.round(monthly),
    cost: Math.round(cost), // cost of executable transactions that move current to candidate
    exp: parseFloat((100 * exp).toFixed(2)),
    roi: parseFloat((100 * roi).toFixed(2)),
    ratio: parseFloat(ratio.toFixed(2)),
  };
}

export function makeCandidates(src, size, jitter) {
  // TODO: all candidates are mutations of the current one
  let candidates = [];
  for (let i = 0; i < size; i++) {
    const candidate = mutateCandidate(src, jitter);
    candidates.push(candidate);
  }
  return candidates;
}

export function candidateCombinations(src) {
  const variants = [-0.1, 0.1]; // +/- 10%
  let results = [];

  function helper(current, index) {
    if (index === src.length) {
      results.push(current.slice()); // copy the array
      return;
    }

    for (let variant of variants) {
      let newValue = src[index] + src[index] * variant;
      newValue = Math.round(newValue / 10) * 10;  // multiple of 10
      current[index] = newValue;
      helper(current, index + 1);
    }
  }

  helper(new Array(src.length), 0);
  return results;
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

export async function lookupDividends(symbol) {
  const response = await fetch(`/dividends/${symbol}.json`);
  const { dividends, expense_ratio, price } = await response.json();

  // exercise date, dividend in dollars
  const oneYearAgo = moment().subtract(1, "years").unix();
  const filterFN = ([date]) => moment(date).unix() >= oneYearAgo;

  const indexed = dividends
    .filter(filterFN)
    .reverse()
    .map(([date, amount], index) => [index + 1, amount]);

  //'linear', 'exponential', 'logarithmic', 'power', 'polynomial',
  const options = { order: 3, precision: 3 };
  const result = regression.linear(indexed, options);

  const sum = (arr) => arr.reduce((acc, val) => acc + val, 0);
  const mean = (arr) => sum(arr) / arr.length;

  const last = indexed[0][1]; // first y is the most recent dividend
  const total = sum(indexed.map(([x, y]) => y));
  const avg = mean(indexed.map(([x, y]) => y));
  const next = result.predict(indexed.length + 1)[1]; // [x, y]

  return {
    last,
    avg,
    next,
    price,
    expenseRatio: expense_ratio, // I know, right?
    yield: total / price,
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
