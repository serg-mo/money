import { parseCSV } from "./common";

export const HEADER_ROW_INDEX = 3;
export const REQUIRED_COLS = [
  "month",
  "beginning balance",
  "market change minus fees",
  "dividends & interest",
  "deposits",
  "withdrawals",
  "ending balance",
];

export function parseBrokerageFile(txt) {
  const lines = txt.split(/\r?\n/);
  const middle = lines.slice(4, lines.length - 8);
  const headers = parseCSV(lines[3]).map((s) => s.toLowerCase());
  // const tail = lines.slice(lines.length - 8); // blank, report date, 6 lines of junk

  return parseTransactions(middle, headers);
}

export function parseTransactions(lines, headers) {
  const makeTransaction = (values) => {
    let combo = Object.fromEntries(
      headers.map((header, index) => [
        header,
        index ? parseFloat(values[index]) : values[index],
      ]),
    );

    // example: "Nov 01 - Nov 30 2020"
    combo["date"] = combo["month"].slice(-11); // e.g., Nov 30 2020
    combo["time"] = new Date(combo["date"]).getTime(); // timesamp
    combo["month"] = combo["date"].slice(0, 3) + " " + combo["date"].slice(-2); // e.g., Jan 22
    combo["withdrawals"] = -combo["withdrawals"];

    return combo;
  };

  return lines.map(parseCSV).map(makeTransaction);
}
