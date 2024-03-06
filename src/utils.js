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
export const COLORS = {
  [CATEGORIES.FOOD]: "yellow",
  [CATEGORIES.INSURANCE]: "teal",
  [CATEGORIES.GYM]: "green",
  [CATEGORIES.HEALTH]: "emerald",
  [CATEGORIES.CAR]: "red",
  [CATEGORIES.PET]: "cyan",
  [CATEGORIES.SHOPPING]: "sky",
  [CATEGORIES.SUBSCRIPTIONS]: "blue",
  [CATEGORIES.TRAVEL]: "indigo",
  [CATEGORIES.FUN]: "orange",
  [CATEGORIES.GIFTS]: "lime",
  [CATEGORIES.UTILITIES]: "violet",

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
  name = name.replace(/\*\S+$/, ""); // e.g., AMZN Mktp US*DC1M32GX3
  name = name.replace(/\*RECUR.+$/, ""); // e.g., GEICO *RECURING PMTS
  name = name.replace(/\d+$/, ""); // e.g., SHELL OIL 57444585400
  name = name.replace(/#\d+.+$/, ""); // e.g., ARCO#82184SUPER POWER
  name = name.trim();

  return name;
}
