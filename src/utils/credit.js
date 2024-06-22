// TODO: I should also be able to prune/save/export my categories, colors, and rules
// to prune, loop through each category - keyword, if there is a transaction for it, remove it
// maybe there is a default categories that you customize and that's what gets saved in browser storage
// consider doing clusters with manual categories, then pick the nearest cluster for unknown ones

// TODO: add typescript
// TODO: write unit tests for all of these
import { createContext } from "react";

export const CreditContext = createContext();

// TODO: ideally there would be at least one transaction per category per month
// TODO: otherwise the stacked area chart will look weird
// TODO: make a map for category, budget, and color
export const CATEGORIES = {
  CAR: "CAR",
  GROCERY: "GROCERY",
  HEALTH: "HEALTH", // includes insurance
  OTHER: "OTHER", // includes gifts
  PET: "PET",
  RESTAURANT: "RESTAURANT",
  SHOPPING: "SHOPPING",
  TRAVEL: "TRAVEL", // includes ubers, flights, hotel, car, and activities
  UNCLASSIFIED: "UNCLASSIFIED",
  UTILITIES: "UTILITIES", // includes subscriptions, gym
};

// category buttons will appear in this order, alphabetically
export const COLORS = {
  [CATEGORIES.CAR]: "rgba(15, 72, 101, 0.8)",
  [CATEGORIES.GROCERY]: "rgba(23, 130, 171, 0.9)",
  [CATEGORIES.HEALTH]: "rgba(230, 154, 43, 0.9)",
  [CATEGORIES.OTHER]: "rgba(200, 200, 200, 0.8)",
  [CATEGORIES.PET]: "rgba(13, 45, 67, 0.75)",
  [CATEGORIES.RESTAURANT]: "rgba(233, 120, 34, 0.85)",
  [CATEGORIES.SHOPPING]: "rgba(19, 100, 134, 0.85)",
  [CATEGORIES.TRAVEL]: "rgba(206, 56, 24, 0.85)",
  [CATEGORIES.UNCLASSIFIED]: "rgba(200, 200, 200, 0.75)",
  [CATEGORIES.UTILITIES]: "rgba(77, 152, 128, 0.8)",
};


// TODO: make a constants file
const MIN_NAME_LENGTH = 23;
const MAX_NAME_LENGTH = 40;

export function getCategory(name, rules) {
  // NOTE: name has a structure: description, city/phone/domain, state
  name = name.toUpperCase();

  // given a name, find a rule with a matching pattern, i.e., name includes pattern
  const match = Object.entries(rules).find(([pattern, category]) =>
    name.includes(pattern),
  );

  // rules is a name => category mapping
  if (match) {
    return match[1]; // category
  }

  return CATEGORIES.UNCLASSIFIED;
}

export function parseCSV(str) {
  return str.split('","').map((one) => one.replace(/^"|"$/g, ""));
}

export function formatAmount(amount) {
  return (Math.round(Math.abs(amount) * 100) / 100).toFixed(2);
}

export function parseName(name) {
  // NOTE: splitting on spaces is not reliable
  return name.toUpperCase().substring(0, MAX_NAME_LENGTH).trim(); // ignore city/phone + state
}

export function parseCreditFile(txt) {
  const lines = txt.split(/\r?\n/);
  const headers = parseCSV(lines[0]).map((v) => v.toLowerCase()); // "date","transaction","name","memo","amount"
  const tail = lines.slice(1, lines.length - 1);

  return parseCreditTransactions(tail, headers);
}

function parseCreditTransactions(lines, headers) {
  // convert each line from an array of strings into an object, where keys are headers
  return lines.map(parseCSV).map((values) => {
    const obj = Object.fromEntries(
      headers.map((header, index) => [header, values[index]]),
    );

    const normalizedName = normalizeName(
      obj["name"].substring(0, MIN_NAME_LENGTH),
    );

    return {
      ...obj,
      key: obj["memo"],
      amount: parseFloat(obj["amount"]),
      category: CATEGORIES.UNCLASSIFIED,
      location: obj["name"].substring(MIN_NAME_LENGTH).trim(),
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
    /SQ\ \*?/i,
    /^SP\ /i,
    /^TST\*/i,
    /^WPY\*/i,
    /^ZSK\*/i,
    /^WF\*/i,
  ];
  for (const prefix of prefixes) {
    name = name.replace(prefix, "");
  }

  // TODO: consider stripping anything but letters, e.g., numbers and punctuation
  name = name.replace(/\*\S+$/, ""); // trailing star + nonspace sequence e.g., AMZN Mktp US*DC1M32GX3
  name = name.replace(/#\d+.+$/, ""); // trailing hashtag + digits, e.g., ARCO#82184SUPER POWER
  name = name.replace(/\s\s\S+$/, ""); // trailing double space + nonspace sequence, e.g., AIRBNB HMC8KZ8Y3F
  name = name.replace(/\d{3,}$/, ""); // trailing digits, e.g., SHELL OIL 57444585400
  name = name.replace(/\*RECUR.+$/, ""); // e.g., GEICO *RECURING PMTS
  name = name.replace(/LYFT\s+\*.+$/, "LYFT"); // e.g., LYFT *2 RIDES 09-20
  name = name.replace(/AMZN MKTP US\*.+$/, "AMZN MKTP US"); // e.g., AMZN MKTP US*HT4P35MN2
  name = name.replace(/AMAZON.COM\*.+$/, "AMAZON.COM"); // e.g., AMAZON.COM*H058W0GR0

  // all must be the same length, see parseName()
  return name.trim().padEnd(MIN_NAME_LENGTH, " ");
}
//console.assert(normalizeName("AMZN MKTP US*HT4P35MN2"), "AMZN MKTP US");
//console.assert(normalizeName("AMZN MKTP US*HT4P35MN2"), "AMZN MKTP US");

export function nameToVector(name) {
  // normalize, then convert each charater into it's ASCII code equivalent
  return name.split("").map((chr) => chr.charCodeAt(0));
}

console.assert(nameToVector("A"), [65]);
console.assert(nameToVector("AB"), [65, 66]);
console.assert(nameToVector("ABC"), [65, 66, 67]);

// given a list of strings, return the longest common prefix (for rule pruning)
function getLongestCommonPrefix(names) {
  if (names.length === 0) {
    return "";
  }

  // smallest of the available names
  let minLength = Math.min(...names.map((name) => name.length));

  let prefix = "";
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
  const opacities = ["opacity-25", "opacity-50", "opacity-75", "opacity-100"];

  // 0..1 => 0..last index
  const scaled = Math.floor(value * (opacities.length - 1));
  const index = Math.min(opacities.length - 1, Math.max(scaled, 0));

  return opacities[index];
}
