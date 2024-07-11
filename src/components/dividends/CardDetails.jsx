import React, { useContext, useState } from "react";
import {
  arrayDifference,
  arrayProduct,
  sum
} from "../../utils/common";
import {
  DividendContext,
} from "../../utils/dividends";

import DividendsChart from "./DividendsChart";

export default function CardDetails({ cards }) {
  const { names, dividends, prices, basis } = useContext(DividendContext);
  const [name, setName] = useState(null);

  const orders = arrayDifference(
    cards.split.candidate,
    cards.current.candidate,
  );

  const costs = arrayProduct(orders, prices).map((cost) => -1 * cost); // negative order means sell, so I get money
  const pnl = arrayProduct(orders.map(v => v < 0 ? -v : 0), arrayDifference(prices, basis)); // only count "sell"

  return (
    <>
      <table className="border-collapse border-gray-900 table-auto m-auto">
        <thead>
          <tr>
            <th>Name</th>
            <th>Last</th>
            <th>Avg</th>
            <th>Next</th>
            <th>Current</th>
            <th>Split</th>
            <th>Order</th>
            <th>Cost</th>
            <th>Price</th>
            <th>Basis</th>
            <th>P&L</th>
          </tr>
        </thead>
        <tbody>
          {names.map((name, index) => (
            <tr key={index}>
              <td className="border"><a href="#" onClick={() => setName(name)} className="hover:underline">{name}</a></td>
              <td className="border">${dividends[index].last}</td>
              <td className="border">${dividends[index].avg}</td>
              <td className="border">${dividends[index].next}</td>
              <td className="border">{cards.current.candidate[index]}</td>
              <td className="border">{cards.split.candidate[index]}</td>
              <td className="border">{orders[index]}</td>
              <td className="border">${costs[index].toFixed()}</td>
              <td className="border">${prices[index].toFixed(2)}</td>
              <td className="border">${basis[index].toFixed(2)}</td>
              <td className="border">${pnl[index].toFixed()}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="border"></td>
            <td className="border"></td>
            <td className="border"></td>
            <td className="border"></td>
            <td className="border">${cards.current.stats.monthly}</td>
            <td className="border">${cards.split.stats.monthly}</td>
            <td className="border"></td>
            <td className="border">${sum(costs).toFixed()}</td>
            <td className="border"></td>
            <td className="border"></td>
            <td className="border">${sum(pnl).toFixed()}</td>
          </tr>
        </tfoot>
      </table>
      {name && (<DividendsChart name={name} next={dividends[names.indexOf(name)].next} />)}
    </>
  );
}
