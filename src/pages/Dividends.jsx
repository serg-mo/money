import React, { useState, useEffect } from "react";
import { evaluateCandidate, DividendContext } from "../utils/dividends";
import DividendDash from "../components/dividends/DividendDash";

// TODO: compute delta/buy/sell/total for a given candidate

// google sheets solver has been broken for a while, so this is my own evolutionary solver
export default function Dividends() {
  const [context, setContext] = useState({}); // TODO: make this a real context

  // NOTE: document must be focuses to read clipboard, so a click is necessary
  async function parseClipboard() {
    await navigator.clipboard
      .readText()
      .then(parseCells)
      .then(getContext)
      .then(setContext);
  }

  const parseCells = (csv) => {
    const cells = csv
      .split(/\r?\n/) // rows
      .map((v) => v.split(/\s/).map((v) => v.replace(/[\$,%]/g, ""))); // columns as bare numbers

    const headers = cells[0];
    const lastRow = cells[cells.length - 1];

    // ignore first and last row, i.e., headers and totals
    const values = cells
      .slice(1, -1)
      .map((row) =>
        Object.fromEntries(
          headers.map((header, index) => [header, row[index]]),
        ),
      );

    const totals = Object.fromEntries(
      headers.map((header, index) => [header, lastRow[index]]),
    );
    // console.log({ values, totals });

    return { values, totals };
  };

  const getContext = ({ values, totals }) => {
    const goalTotal = parseFloat(totals["COST"]); // does not matter, that's the column goalTotal
    const goalMonthly = parseFloat(totals["PRICE"]);
    // TODO: show these
    const minPercent = parseFloat(totals["MIN"]);
    const maxPercent = parseFloat(totals["MAX"]);

    const current = values.map((v) => parseInt(v["NOW"]));
    const mins = values.map((v) => parseFloat(v["MIN"]));
    const maxes = values.map((v) => parseFloat(v["MAX"]));
    const expenses = values.map((v) => parseFloat(v["EXP"]) / 100); // expense ratio, percent to float
    const dividends = values.map((v) => parseFloat(v["NEXT"])); // next month's dividend estimate
    const prices = values.map((v) => parseFloat(v["PRICE"]));

    const getStats = (candidate) =>
      evaluateCandidate(candidate, expenses, dividends, prices);

    const isPass = (candidate) => {
      const { total, monthly } = getStats(candidate);
      return total <= goalTotal && monthly >= goalMonthly;
    };

    return {
      current,
      mins,
      maxes,
      getStats,
      isPass,
    };
  };

  // TODO: trigger button/file input should look the same
  // TODO: continuously evaluate candidates in batches of 10
  // TODO: chart current batch candidate performance
  // TODO: do not show the parse button if clipboard is empty

  if (!Object.keys(context).length) {
    return (
      <div className="w-full flex justify-center">
        <button
          className={`text-lg text-white font-bold my-4 p-4 bg-blue-500 hover:bg-blue-700 rounded`}
          onClick={parseClipboard}
        >
          Parse
        </button>
      </div>
    );
  }

  return (
    <DividendContext.Provider value={context}>
      <DividendDash />
    </DividendContext.Provider>
  );
}
