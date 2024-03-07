// TODO: I should also be able to prune/save/export my categories, colors, and rules
// to prune, loop through each category - keyword, if there is a transaction for it, remove it
// maybe there is a default categories that you customize and that's what gets saved in browser storage
// consider doing clusters with manual categories, then pick the nearest cluster for unknown ones

export const CATEGORIES = {
  CAR: "CAR",
  FUN: "FUN",
  OTHER: "OTHER",
  FOOD: "FOOD",
  GIFTS: "GIFTS",
  GYM: "GYM",
  HEALTH: "HEALTH",
  INSURANCE: "INSURANCE",
  PET: "PET",
  SHOPPING: "SHOPPING",
  SUBSCRIPTIONS: "SUBSCRIPTIONS",
  TRAVEL: "TRAVEL",
  UTILITIES: "UTILITIES",
  UNCLASSIFIED: "UNCLASSIFIED",
};

// TODO: prune tailwind color names down to 10
// slate, gray, zinc, neutral, stone,
// red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose

// TODO: first classify everything, then sort categories by size, then pick the colors
// category buttons will appear in this order
export const COLORS = {
  [CATEGORIES.FOOD]: "yellow",
  [CATEGORIES.SHOPPING]: "sky",
  [CATEGORIES.CAR]: "red",
  [CATEGORIES.PET]: "cyan",
  [CATEGORIES.SUBSCRIPTIONS]: "blue",
  [CATEGORIES.TRAVEL]: "indigo",

  [CATEGORIES.HEALTH]: "emerald",
  [CATEGORIES.FUN]: "orange",
  [CATEGORIES.GIFTS]: "lime",
  [CATEGORIES.UTILITIES]: "violet",
  [CATEGORIES.GYM]: "green",
  [CATEGORIES.INSURANCE]: "teal",
  [CATEGORIES.OTHER]: "amber",
  [CATEGORIES.UNCLASSIFIED]: "slate",
};

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
  // NOTE: some names have a * in it + unique id or just ignore any sequence of 3+ numbers
  // NOTE: splitting on spaces is not reliable

  return name.toUpperCase().substring(0, 23).trim(); // ignore city/phone + state
}

export function parseCreditFile(lines) {
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

    // TODO: consider inspecting the last character instead
    obj["amount"] = parseFloat(obj["amount"]);
    obj["category"] = CATEGORIES.UNCLASSIFIED;

    return obj;
  });
}

// TODO: add typescript
// TODO: write unit tests for all of these
export function normalizeName(name) {
  // remove processor prefixes, e.q., Square, Toast, WePay
  const prefixes = [/SQ\ \*?/i, /^SP\ /i, /^TST\*/i, /^WPY\*/i, /^ZSK\*/i];
  for (const prefix of prefixes) {
    name = name.replace(prefix, "");
  }

  name = name.replace(/\*\S+$/, ""); // trailing star + nonspace sequence e.g., AMZN Mktp US*DC1M32GX3
  name = name.replace(/#\d+.+$/, ""); // trailing hashtag + digits, e.g., ARCO#82184SUPER POWER
  name = name.replace(/\s\s\S+$/, ""); // trailing double space + nonspace sequence, e.g., AIRBNB HMC8KZ8Y3F
  name = name.replace(/\d+$/, ""); // trailing digits, e.g., SHELL OIL 57444585400

  name = name.replace(/\*RECUR.+$/, ""); // e.g., GEICO *RECURING PMTS

  name = name.trim();

  return name;
}

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
