import React, { useState } from "react";
import {
  REQUIRED_COLS,
  evaluateCandidate,
  DividendContext,
} from "../utils/dividends";
import DividendDash from "../components/dividends/DividendDash";
import Target from "../components/Target";

// TODO: compute delta/buy/sell/total for a given candidate

// google sheets solver has been broken for a while, so this is my own evolutionary solver
export default function Dividends() {
  const [context, setContext] = useState({}); // TODO: make this a real context
  const [error, setError] = useState(null);

  // NOTE: document must be focuses to read clipboard, so a click is necessary
  async function parseClipboard() {
    await navigator.clipboard
      .readText()
      .then(parseCells)
      .then(getContext)
      .then(setContext)
      .catch((e) => setError(e.message));
  }

  const parseCells = (csv) => {
    // split on newlines, whitespace, and prase bare numbers
    const cells = csv
      .split(/\r?\n/)
      .map((row) => row.split(/\s/).map((v) => v.replace(/[\$,%]/g, "")));

    const [headers, footers] = [cells[0], cells[cells.length - 1]];

    if (!REQUIRED_COLS.every((col) => headers.includes(col))) {
      throw new Error("Empty clipboard");
    }

    const rowToObject = (row) => {
      return Object.fromEntries(
        headers.map((header, index) => [header, row[index]]),
      );
    };

    // rows to header-keyed objects, ignore headers and footers
    const values = cells.slice(1, -1).map(rowToObject);
    const totals = rowToObject(footers);

    // console.log({ values, totals });
    return { values, totals };
  };

  const getContext = ({ values, totals }) => {
    const goalTotal = parseFloat(totals["COST"]); // does not matter, that's the column goalTotal
    const goalMonthly = parseFloat(totals["PRICE"]);

    const names = values.map((v) => v["NAME"]);
    const current = values.map((v) => parseInt(v["NOW"]));
    const expenses = values.map((v) => parseFloat(v["EXP"]) / 100); // expense ratio, percent to float
    const dividends = values.map((v) => parseFloat(v["NEXT"])); // next month's dividend estimate
    const prices = values.map((v) => parseFloat(v["PRICE"]));

    return {
      names,
      current,
      goalTotal,
      goalMonthly,
      getStats: (c) => evaluateCandidate(c, expenses, dividends, prices),
    };
  };

  // TODO: do not show the parse button if clipboard is empty

  if (!Object.keys(context).length) {
    return (
      <Target onClick={parseClipboard}>
        {error ? (
          <div className="text-red-300">{error}</div>
        ) : (
          <div className="text-sm text-gray-300">{REQUIRED_COLS.join(",")}</div>
        )}
      </Target>
    );
  }

  return (
    <DividendContext.Provider value={context}>
      <div className="flex flex-col justify-center items-center">
        <DividendDash />
      </div>
    </DividendContext.Provider>
  );
}
