import { createContext } from "react";
import { splitCells, rowToObjectWithKeys } from "./common";
export const DividendContext = createContext();
import moment from "moment";
import regression from "regression";

// NOTE: this only works with a specific shape
export const CARD_SORTS = {
  maxMonthly: (a, b) => b.stats.monthly - a.stats.monthly, // DESC, highest first
  minTotal: (a, b) => a.stats.total - b.stats.total, // ASC, lowest first
  maxRatio: (a, b) => b.stats.ratio - a.stats.ratio, // DESC, highest first
  maxRoi: (a, b) => b.stats.roi - a.stats.roi, // DESC, highest first
};

export const REQUIRED_COLS = ["EXP", "NEXT", "COST", "PRICE", "NOW"];

export function parseDividendFile(txt) {
  // only look at the first few columns, because headers repeat, e.g., weight
  const cells = splitCells(txt).map((row) => row.slice(0, 9));

  // 0 - header, 1-10 funds, 11 - footer
  const [headers, footers] = [cells[0], cells[11]];
  //console.log({ cells, headers, footers });

  if (!REQUIRED_COLS.every((col) => headers.includes(col))) {
    throw new Error("Empty clipboard");
  }

  const objectify = rowToObjectWithKeys(headers);
  const values = cells.slice(1, 11).map(objectify); // ignore header/footer
  const totals = objectify(footers);
  // console.log({ values, totals });

  const goalTotal = parseFloat(totals["COST"]); // does not matter, that's the column goalTotal
  const goalMonthly = parseFloat(totals["PRICE"]);
  // console.log({ goalTotal, goalMonthly });

  const names = values.map((v) => v["NAME"]);
  const current = values.map((v) => parseInt(v["NOW"]));
  const expenses = values.map((v) => parseFloat(v["EXP"]) / 100); // expense ratio, percent to float
  const dividends = values.map((v) => parseFloat(v["NEXT"])); // next month's dividend estimate
  const prices = values.map((v) => parseFloat(v["PRICE"]));

  const getStats = (c) => evaluateCandidate(c, expenses, dividends, prices);

  return {
    names,
    prices,
    current,
    goalTotal,
    goalMonthly,
    getStats,
  };
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

// console.assert(mutateValue(300) !== 300, "mutateValue");
// TODO: positive values only, but somehow I get negatives
export function mutateValue(value, jitter, multiple) {
  const direction = Math.random() < 0.5 ? 1 : -1;
  const magnitude = Math.floor(Math.random() * jitter * value);
  return Math.round((value + direction * magnitude) / multiple) * multiple;
  //return Math.round(value + direction * magnitude);
}

export function evaluateCandidate(candidate, expenses, dividends, prices) {
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

export function makeCandidates(src, size, jitter) {
  // TODO: all candidates are mutations of the current one
  let candidates = [];
  for (let i = 0; i < size; i++) {
    // TODO: figure out mutation strategy
    const candidate = mutateCandidate(src, jitter);
    candidates.push(candidate);
  }
  return candidates;
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
  const data = await response.json();

  // exercise date, dividend in dollars
  const oneYearAgo = moment().subtract(1, "years").unix();
  const filterFN = ([date]) => moment(date).unix() >= oneYearAgo;

  return data.chart_data[0][0].raw_data.filter(filterFN).reverse();
}

export function summarizeDividends(original) {
  const data = original.map(([date, amount], index) => [index + 1, amount]);

  //'linear', 'exponential', 'logarithmic', 'power', 'polynomial',
  const options = { order: 1, precision: 4 };
  const result = regression.linear(data, options);

  const mean = (arr) => arr.reduce((acc, val) => acc + val, 0) / arr.length;
  const avg = mean(data.map(([x, y]) => y));
  const next = result.predict(data.length + 1)[1]; // [x, y]

  return { avg, next };
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
