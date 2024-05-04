import { createContext } from "react";

export const DividendContext = createContext();

// NOTE: this only works with a specific shape
export const CARD_SORTS = {
  maxMonthly: (a, b) => b.stats.monthly - a.stats.monthly, // DESC, highest first
  minTotal: (a, b) => a.stats.total - b.stats.total, // ASC, lowest first
  maxRatio: (a, b) => b.stats.ratio - a.stats.ratio, // DESC, highest first
  maxRoi: (a, b) => b.stats.roi - a.stats.roi, // DESC, highest first
};

export const REQUIRED_COLS = ["EXP", "NEXT", "COST", "PRICE", "NOW"];

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

export function makeCandidates(size, src, jitter) {
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
  const out = ({ stats }) => stats[prop];

  return cards.filter((card) => {
    const key = out(card);
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
  // either total (less, +margin) and monthly (more, -margin)
  return (
    getUnitDistanceOnStat(a, b, "total") < totalMargin ||
    getUnitDistanceOnStat(a, b, "monthly") > -monthlyMargin
  );
}

function isBetterStats(a, b, totalMargin, monthlyMargin) {
  // both total (less, +margin) and monthly (more, -margin)
  return (
    getUnitDistanceOnStat(a, b, "total") < totalMargin &&
    getUnitDistanceOnStat(a, b, "monthly") > -monthlyMargin
  );
}

export function isCloseToCard(focusCard, totalMargin = 50, monthlyMargin = 1) {
  return (card) => isCloseStats(card, focusCard, totalMargin, monthlyMargin);
}

export function isBetterThanCard(
  focusCard,
  totalMargin = 0,
  monthlyMargin = 0,
) {
  return (card) => isBetterStats(card, focusCard, totalMargin, monthlyMargin);
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

// should be 261
/*
console.log(
  sumProduct(
    [0.11, 0.14, 0.44, 0.14, 0.16, 0.17, 0.22, 0.18, 0.13, 0.31],
    [300, 50, 70, 80, 300, 220, 210, 90, 90, 70],
  ),
);
*/
