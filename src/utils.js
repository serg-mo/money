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
  [CATEGORIES.CAR]: "red",
  [CATEGORIES.FUN]: "orange",
  [CATEGORIES.OTHER]: "amber",
  [CATEGORIES.FOOD]: "yellow",
  [CATEGORIES.GIFTS]: "lime",
  [CATEGORIES.GYM]: "green",
  [CATEGORIES.HEALTH]: "emerald",
  [CATEGORIES.INSURANCE]: "teal",
  [CATEGORIES.PET]: "cyan",
  [CATEGORIES.SHOPPING]: "sky",
  [CATEGORIES.SUBSCRIPTIONS]: "blue",
  [CATEGORIES.TRAVEL]: "indigo",
  [CATEGORIES.UTILITIES]: "violet",
  [CATEGORIES.UNCLASSIFIED]: "slate",
};

export function getCategory(name, rules) {
  // TODO: split on \s+ and only match the description
  // NOTE: name has a structure: description, city, state
  // city is sometimes a phone number or a domain name
  name = name.toUpperCase().replace(/\s+/g, " ");

  const match = Object.entries(rules).find(([key, values]) =>
    values.find((value) => name.includes(value)),
  );

  if (match) {
    return match[0]; // key
  }

  // TODO: this should be a named constant
  return CATEGORIES.UNCLASSIFIED;
}

export function parseCSV(str) {
  return str.split('","').map((one) => one.replace(/^"|"$/g, ""));
}

export function formatAmount(amount) {
  return (Math.round(Math.abs(amount) * 100) / 100).toFixed(2);
}

export function parseName(name) {
  // NOTE: some names have a * in it + unique id
  // NOTE: splitting on spaces is not reliable

  return name.toUpperCase().substring(0, 23).trim(); // ignore city/phone + state
}
