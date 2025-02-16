// TODO: I should also be able to prune/save/export my categories, colors, and rules
// to prune, loop through each category - keyword, if there is a transaction for it, remove it
// maybe there is a default categories that you customize and that's what gets saved in browser storage
// consider doing clusters with manual categories, then pick the nearest cluster for unknown ones

// TODO: add typescript
// TODO: write unit tests for all of these
import moment from 'moment';
import { createContext } from 'react';
import { parseCSV } from './common';
export const CreditContext = createContext();

// TODO: ideally there would be at least one transaction per category per month
// TODO: otherwise the stacked area chart will look weird
// TODO: make a map for category, budget, and color

// NOTE: match the order of COLORS, so tabs match datasets in the chart
// TODO: come up with an easy way to set this up at the beginning
export const CATEGORIES = {
  GROCERY: 'GROCERY',
  UTILITIES: 'UTILITIES', // includes subscriptions, gym
  HEALTH: 'HEALTH', // includes insurance
  PET: 'PET',
  CAR: 'CAR',

  RESTAURANT: 'RESTAURANT',
  SHOPPING: 'SHOPPING',
  TRAVEL: 'TRAVEL', // includes taxi, flight, hotel, car, and activities

  OTHER: 'OTHER', // includes gifts
  UNCLASSIFIED: 'UNCLASSIFIED',
};

// stacked chart datasets appear in this order
export const COLORS = {
  [CATEGORIES.GROCERY]: 'rgb(3, 4, 94)',
  [CATEGORIES.UTILITIES]: 'rgb(0, 119, 182)',
  [CATEGORIES.HEALTH]: 'rgb(0, 180, 216)',
  [CATEGORIES.PET]: 'rgb(144, 224, 239)',
  [CATEGORIES.CAR]: 'rgb(202, 240, 248)',

  [CATEGORIES.RESTAURANT]: 'rgb(255, 102, 0)',
  [CATEGORIES.SHOPPING]: 'rgb(255, 128, 51)',
  [CATEGORIES.TRAVEL]: 'rgb(255, 153, 102)',

  [CATEGORIES.OTHER]: 'rgb(142, 142, 142)',
  [CATEGORIES.UNCLASSIFIED]: 'rgb(85, 85, 85)',
};

// TODO: make a constants file
const MIN_NAME_LENGTH = 23;
const MAX_NAME_LENGTH = 40;

export const HEADER_ROW_INDEX = 0;
export const REQUIRED_COLS = ['date', 'transaction', 'name', 'memo', 'amount'];

export function getCategory(name, rules) {
  // NOTE: name has a structure: description, city/phone/domain, state
  name = name.toUpperCase();

  // given a name, find a rule with a matching pattern, i.e., name includes pattern
  const match = Object.entries(rules).find(([pattern, category]) =>
    name.includes(pattern)
  );

  // rules is a name => category mapping
  return match ? match[1] : CATEGORIES.UNCLASSIFIED;
}

export function formatAmount(amount) {
  return (Math.round(Math.abs(amount) * 100) / 100).toFixed(2);
}

export function parseName(name) {
  // NOTE: splitting on spaces is not reliable
  return name.toUpperCase().substring(0, MAX_NAME_LENGTH).trim(); // ignore city/phone + state
}

function getSunday(date) {
  return moment(date).day(0).format('YYYY-MM-DD');
}

export function parseCreditFile(txt) {
  const lines = parseCSV(txt);
  const headers = lines[0].map((v) => v.toLowerCase());
  const tail = lines.slice(1, lines.length - 1);

  // TODO: const objectify = rowToObjectWithKeys(headers);
  // convert each line from an array of strings into an object, where keys are headers
  return tail.map((values) => {
    const obj = Object.fromEntries(
      headers.map((header, index) => [header, values[index]])
    );

    const normalizedName = normalizeName(
      obj['name'].substring(0, MIN_NAME_LENGTH)
    );

    return {
      ...obj,
      week: moment(obj['date']).day(0).format('YYYY-MM-DD'), // date of the Sunday of that week
      month: moment(obj['date']).format('YYYY-MM'),
      key: obj['memo'],
      amount: parseFloat(obj['amount']),
      category: CATEGORIES.UNCLASSIFIED,
      location: obj['name'].substring(MIN_NAME_LENGTH).trim(),
      normalizedName: normalizedName,
      vector: nameToVector(normalizedName),
      confidences: {},
    };
  });
}

export function normalizeName(name) {
  // NOTE: some names have a * in it + unique id or just ignore any sequence of 3+ numbers
  name = name.toUpperCase().trim();

  // remove processor prefixes, e.q., Square, Toast, WePay
  const prefixes = [
    /^IC\*/i, // instacart
    /^SP\ /i,
    /^TST\*/i,
    /^WF\*/i,
    /^WPY\*/i,
    /^ZSK\*/i,
    /SQ\ \*?/i,
  ];
  for (const prefix of prefixes) {
    name = name.replace(prefix, '');
  }

  // TODO: consider stripping anything but letters, e.g., numbers and punctuation
  name = name.replace(/\*\S+$/, ''); // trailing star + nonspace sequence e.g., AMZN Mktp US*DC1M32GX3
  name = name.replace(/#\d+.+$/, ''); // trailing hashtag + digits, e.g., ARCO#82184SUPER POWER
  name = name.replace(/\s\s\S+$/, ''); // trailing double space + nonspace sequence, e.g., AIRBNB HMC8KZ8Y3F
  name = name.replace(/\d{3,}$/, ''); // trailing digits, e.g., SHELL OIL 57444585400
  name = name.replace(/\*RECUR.+$/, ''); // e.g., GEICO *RECURING PMTS
  name = name.replace(/LYFT\s+\*.+$/, 'LYFT'); // e.g., LYFT *2 RIDES 09-20
  name = name.replace(/AMZN MKTP US\*.+$/, 'AMZN MKTP US'); // e.g., AMZN MKTP US*HT4P35MN2
  name = name.replace(/AMAZON.COM\*.+$/, 'AMAZON.COM'); // e.g., AMAZON.COM*H058W0GR0

  // all must be the same length, see parseName()
  return name.trim().padEnd(MIN_NAME_LENGTH, ' ');
}
//console.assert(normalizeName("AMZN MKTP US*HT4P35MN2"), "AMZN MKTP US");
//console.assert(normalizeName("AMZN MKTP US*HT4P35MN2"), "AMZN MKTP US");

export function nameToVector(name) {
  // normalize, then convert each charater into it's ASCII code equivalent
  return name.split('').map((chr) => chr.charCodeAt(0));
}

console.assert(nameToVector('A'), [65]);
console.assert(nameToVector('AB'), [65, 66]);
console.assert(nameToVector('ABC'), [65, 66, 67]);

// given a list of strings, return the longest common prefix (for rule pruning)
function getLongestCommonPrefix(names) {
  if (names.length === 0) {
    return '';
  }

  // smallest of the available names
  let minLength = Math.min(...names.map((name) => name.length));

  let prefix = '';
  for (let i = 0; i < minLength; i++) {
    const char = names[0][i]; // i-th character from the first name
    if (names.every((str) => str[i] === char)) {
      prefix += char;
    } else {
      break; // stop on the first mismatch
    }
  }

  return prefix;
}

/*
console.log(
  getLongestCommonPrefix([
    "LYFT   *1 RIDE 05-",
    "LYFT   *1 RIDE 06-",
    "LYFT   *1 RIDE 07-",
    "LYFT   *1 RIDE 09-",
    "LYFT   *2 RIDES 04-",
    "LYFT   *2 RIDES 09-20",
    "LYFT   *3 RIDES 02-",
  ]),
);
// "LYFT   *"
*/

export function formatConfidence(value) {
  return `${Math.round(value * 100 * 100) / 100}%`;
}

export function getOpacity(value) {
  const opacities = ['opacity-25', 'opacity-50', 'opacity-75', 'opacity-100'];

  // 0..1 => 0..last index
  const scaled = Math.floor(value * (opacities.length - 1));
  const index = Math.min(opacities.length - 1, Math.max(scaled, 0));

  return opacities[index];
}
