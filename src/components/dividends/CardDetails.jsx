import React, { useContext, useState } from "react";
import {
  DividendContext,
  arrayDifference,
  arrayProduct,
  arraySum
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
  const pnl = arrayProduct(orders, arrayDifference(prices, basis));

  const totals = {
    last: arraySum(
      arrayProduct(
        cards.split.candidate,
        dividends.map((d) => d.last),
      ),
    ),
    avg: arraySum(
      arrayProduct(
        cards.split.candidate,
        dividends.map((d) => d.avg),
      ),
    ),
    next: arraySum(
      arrayProduct(
        cards.split.candidate,
        dividends.map((d) => d.next),
      ),
    ),
    costs: arraySum(costs),
    pnl: arraySum(pnl),
  };

  // TODO: make the names clickable and show dividend chart with avg, last, next
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
              <td className="border"><a href="#" onClick={() => setName(name)}>{name}</a></td>
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
            <td className="border">${totals.last.toFixed()}</td>
            <td className="border">${totals.avg.toFixed()}</td>
            <td className="border">${totals.next.toFixed()}</td>
            <td className="border"></td>
            <td className="border"></td>
            <td className="border"></td>
            <td className="border">${totals.costs.toFixed()}</td>
            <td className="border">${totals.pnl.toFixed()}</td>
            <td className="border"></td>
            <td className="border"></td>
          </tr>
        </tfoot>
      </table>
      <DividendsChart name={name} />
    </>
  );
}
