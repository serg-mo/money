// each category will need a color
export const CHART_COLORS = {
  red: "rgb(255, 99, 132)",
  orange: "rgb(255, 159, 64)",
  yellow: "rgb(255, 205, 86)",
  green: "rgb(75, 192, 192)",
  blue: "rgb(54, 162, 235)",
  purple: "rgb(153, 102, 255)",
  grey: "rgb(201, 203, 207)",

  one: "rgb(255, 99, 132)",
  two: "rgba(23,130,171,1)",

  three: "rgb(255, 99, 132)",
  four: "rgba(19,100,134,1)",
};

// this is unique to my spending and it will change over time,
// TODO: maybe there is a way to come up with this automatically, given transactions - classify them in order
// TODO: consider a dropdown next to each unclassified transaction that lets me pick a category
// I should also be able to prune/save/export this
// to prune, loop through each category - keyword, if there is a transaction for it, remove it
// maybe there is a default categories that you customize and that's what gets saved in browser storage
// consider doing clusters with manual categories, then pick the nearest cluster for unknown ones

// subscriptions, phone, utilities, insurance, transport, food

// TODO: generate the keywords manually, only maintain the keys of top categories here
const CATEGORIES = [
  "CAR",
  "ENTERTAINMENT",
  "FEES",
  "FOOD",
  "GIFTS",
  "GYM",
  "HEALTH",
  "INSURANCE",
  "PET",
  "SHOPPING",
  "SUBSCRIPTIONS",
  "TRAVEL",
  "UTILITIES",
];

/*
const rules = {
  FOOD: [
    "BAR",
    "BEVERAGES",
    "BOBA",
    "BRECKS",
    "BREWING",
    "CAFE",
    "COFFEE",
    "DINING",
    "EATERY",
    "FARM",
    "FOOD",
    "GOURMET",
    "HING",
    "MARKET",
    "NEW LIEN HING",
    "PAPERBACK",
    "RESTAURANT",
    "STARBUCKS",
    "STICKY RICE",
    "TACOS",
    "WORLD CELLAR",
    "WINE",
    "SPIRITS",
    "LA MAR",
    "HIGH-LOW",
    "THE PLOUGH & THE STARS",
  ],
  GYM: ["GYM", "WODIFY", "YOGA"],
  HEALTH: [
    "CLINIC",
    "CVS",
    "DENTIST",
    "DOCTOR",
    "HEALTH",
    "HOSPITAL",
    "MED",
    "PHARMACY",
    "PODIATRY",
    "SURGICAL",
    "WESTSIDE HEAD NECK",
  ],
  INSURANCE: ["ANTHEM", "ERENTERPLAN", "GEICO", "LEMONADE"],
  TRAVEL: ["AIRBNB", "HOTEL", "LODGING", "RESORT", "SHERATON", "ACE HOTEL"],
  PET: ["CHEWY", "DOG", "PET", "VETERINARY"],
  SHOPPING: [
    ".COM",
    "ALDO",
    "ALIEXPRESS",
    "AMZN",
    "BEST BUY",
    "BROOKS",
    "COSTCO",
    "ETSY",
    "HTTP",
    "HTTPS",
    "IKEA",
    "J. CREW",
    "LOVERAMICS",
    "MARSHALLS",
    "MICHAELS",
    "NORDSTROM-RACK",
    "PAYPAL",
    "POINT OF SALE",
    "RETAIL",
    "SIGNATURE PLASTICS",
    "SQ",
    "STEAM",
    "TARGET",
    "TOTAL WINE",
    "UNIQLO",
    "WWW",
    "REI",
    "AWERS INC",
    "PATAGONIA",
    "ACE",
    "HOME DEPOT",
    "A RUNNERS MIND",
  ],
  SUBSCRIPTIONS: ["CHATGPT", "GOOGLE", "SPOTIFY"],
  CAR: [
    "AIRPORT",
    "CLIPPER",
    "DMV",
    "JIFFY LUBE",
    "LYFT",
    "MTA",
    "PARKING",
    "PARKIN",
    "RIDECO",
    "TOLL",
    "TOYOTA",
    "TRANSPORT",
    "UBER",
    "U-HAUL",
    "JUNIPERO LONG BEACH",
    "PYRAMID LAKE",
    "54TH PLACE LONG BEACH",
    "LEO CARRILLO",
    "BELMONT PIER LONG BEACH",
    "76",
    "ARCO",
    "CHEVRON",
    "CONOCO",
    "EXXON",
    "FUEL",
    "GAS",
    "LOVE'S",
    "MAVERIK",
    "OIL",
    "PHILLIPS 66",
    "SHELL",
    "SPEEDWAY",
    "PILOT",
    "OSKO KARAGHOSSIAN",
    "EZTRIP",
    "CAR WASH",
    "WHEEL WORKS",
    "ROBERT'S AUTO SERVICE",
  ],
  UTILITIES: [
    "ATT",
    "COMCAST",
    "GWP",
    "PG&E",
    "UTILITIES",
    "VZWRLSS",
    "DRY CLEANERS",
    "SUNSET SCAVENGER",
    "WIRELESS PLUS",
  ],
  FEES: ["FEE"],
  GIFTS: ["FRANK DARLING", "CHEFKNIVESTOGO", "SALT CAVES"],
  ENTERTAINMENT: ["THEATER", "THEATRES"],
};
*/

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

  return "OTHER";
}

export function parseCSV(str) {
  return str.split('","').map((one) => one.replace(/^"|"$/g, ""));
}
