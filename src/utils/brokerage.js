import { parseCSV, rowToObjectWithKeys } from "./common";

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

export function getFileName(txt) {
  const lines = parseCSV(txt);
  const header = lines[1].map((s) => s.toLowerCase());

  return `Brokerage: *${header[0].slice(-4)}`; // last digits
}

export function parseBrokerageFile(txt) {
  const lines = parseCSV(txt);
  const headers = lines[HEADER_ROW_INDEX].map((s) => s.toLowerCase());
  const middle = lines.slice(HEADER_ROW_INDEX + 1, lines.length - 8);
  // const tail = lines.slice(lines.length - 8); // blank, report date, 6 lines of junk

  const objectify = rowToObjectWithKeys(headers);

  const makeTransaction = (values) => {
    let combo = objectify(values)
    // TODO: parseFloat on anything but the first value

    // example: "Nov 01 - Nov 30 2020"
    combo["date"] = combo["month"].slice(-11); // e.g., Nov 30 2020
    combo["time"] = new Date(combo["date"]).getTime(); // timesamp
    combo["month"] = combo["date"].slice(0, 3) + " " + combo["date"].slice(-2); // e.g., Jan 22
    combo["withdrawals"] = -combo["withdrawals"]; // negative withdrawals

    return combo;
  };

  return middle.map(makeTransaction);
}
