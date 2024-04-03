import React, { useState } from "react";

function sumProduct(...arrays) {
  const size = arrays[0].length;

  if (!arrays.every((arr) => arr.length === size)) {
    throw new Error("All arrays must be of the same length");
  }

  let sum = 0;
  for (let i = 0; i < size; i++) {
    sum += arrays.reduce((acc, arr) => acc * arr[i], 1); // multiply all elements at the same index
  }
  return sum;
}

function makeNewCandidate(mins, maxes) {
  if (mins.length !== maxes.length) {
    throw new Error("Arrays must have the same length");
  }

  // NOTE: includes min and max
  return mins.map((min, index) => {
    const range = maxes[index] - min + 1;
    return Math.floor(Math.random() * range) + min;
  });
}

function evaluateCandidate(candidate, expenses, dividends, prices) {
  const total = sumProduct(candidate, prices);
  const monthly = sumProduct(candidate, dividends);
  const exp = sumProduct(candidate, prices, expenses) / total;
  const roi = (monthly * 12) / total;
  const ratio = roi / exp; // NOTE: this is what we're trying to maximize

  return {
    total: Math.round(total),
    monthly: Math.round(monthly),
    exp: (100 * exp).toFixed(4) + "%",
    roi: (100 * roi).toFixed(4) + "%",
    ratio: parseFloat(ratio.toFixed(4)),
  };
}

// google sheets solver has been broken for a while, so this is my own evolutionary solver
export default function AppDividends() {
  const TOP_SIZE = 10; // only show this many top candidates
  const SEARCH_SIZE = 100_000; // consider this many candidates
  // const [topCandidates, setTopCandidates] = useState([]);

  const handleChange = (e) => {
    const cells = e.target.value
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

    const goalTotal = parseFloat(totals["COST"]);
    const goalMonthly = parseFloat(totals["PRICE"]);
    //console.log({ goalTotal, goalMonthly });

    // const current = values.map((v) => parseInt(v["NOW"]));
    const expenses = values.map((v) => parseFloat(v["EXP"]) / 100); // expense ratio, percent to float
    const prices = values.map((v) => parseFloat(v["PRICE"]));
    const dividends = values.map((v) => parseFloat(v["NEXT"])); // next month's dividend estimate
    const mins = values.map((v) => parseFloat(v["MIN"]));
    const maxes = values.map((v) => parseFloat(v["MAX"]));
    // console.log(evaluateCandidate(current, expenses, dividends, prices));

    // TODO: this would be a good place to split

    let topCandidates = [];
    for (let i = 0; i < SEARCH_SIZE; i++) {
      const candidate = makeNewCandidate(mins, maxes);
      const stats = evaluateCandidate(candidate, expenses, dividends, prices);

      // NOTE: passing criteria
      if (stats.total <= goalTotal && stats.monthly >= goalMonthly) {
        const payload = { values: candidate.join(","), ...stats };

        if (topCandidates.length < TOP_SIZE) {
          topCandidates.push(payload);
        } else {
          // replace the worst candidate if the current candidate has a better ratio
          if (stats.ratio > topCandidates[topCandidates.length - 1].ratio) {
            topCandidates[topCandidates.length - 1] = payload;
          }
        }
        topCandidates.sort((a, b) => b.ratio - a.ratio); // descending
      }
    }
    console.log(`Search size ${SEARCH_SIZE / 1000}k`);
    console.table(topCandidates);
    // console.log(topCandidates.map(({ candidate }) => candidate.join(",")));

    // TODO: use state to set topCandidates
    // TODO: mutate top candidates by 10% in either direction
  };

  // TODO: render topCandidates here
  /*
  if (topCandidates.length) {
    return (
      <table>
        <tr>
          <th>Candidate</th>
          <th>Total</th>
          <th>Monthly</th>
          <th>Ratio</th>
        </tr>

        {topCandidates.map(({ candidate, ...stats }, index) => (
          <tr key={index}>
            <td>{candidate.join(",")}</td>
            <td>{stats.total}</td>
            <td>{stats.monthly}</td>
            <td>{stats.ratio}</td>
          </tr>
        ))}
      </table>
    );
  }*/

  return (
    <div className="flex justify-center items-center align-middle">
      <textarea
        className="form-textarea mt-1 block w-full border-2 border-gray-300 p-3 rounded-md shadow-sm"
        rows="12"
        cols="14"
        placeholder="Paste Dividends Sheet"
        onChange={handleChange}
      ></textarea>
    </div>
  );
}
