import React, { useContext, useState } from 'react';
import { arrayDifference, arrayProduct, sum } from '../../utils/common';
import { DividendContext } from '../../utils/dividends';

import DividendsChart from './DividendsChart';

export default function CardDetails({ cards }) {
  const { names, dividends, prices, basis } = useContext(DividendContext);
  const [name, setName] = useState(null);

  const orders = arrayDifference(
    cards.split.candidate,
    cards.current.candidate
  );

  const net = arrayProduct(orders, prices).map((cost) => -1 * cost); // negative order means sell, so I get money
  const pnl = arrayProduct(
    orders.map((v) => (v < 0 ? -v : 0)),
    arrayDifference(prices, basis)
  ); // only count "sell"

  const formatDollars = (value, precision = 0) =>
    `${value < 0 ? '-' : ''}\$${Math.abs(value).toFixed(precision)}`;

  return (
    <>
      <table className="border-collapse border-black-1000 table-auto m-auto font-monaco">
        <thead>
          <tr>
            <th>Name</th>
            <th>Current</th>
            <th>Split</th>
            <th>Order</th>
            <th className="text-right">Net</th>
            <th>Price</th>
            <th>Basis</th>
            <th>P&L</th>
          </tr>
        </thead>
        <tbody>
          {names.map((name, index) => (
            <tr key={index}>
              <td className="border border-r border-r-8">
                <a
                  href="#"
                  onClick={() => setName(name)}
                  className="hover:underline"
                >
                  {name}
                </a>
              </td>
              <td className="border">{cards.current.candidate[index]}</td>
              <td className="border border-r border-r-8">
                {cards.split.candidate[index]}
              </td>
              <td className="border">{orders[index]}</td>
              <td className="border border-r border-r-8 text-right">
                {formatDollars(net[index])}
              </td>
              <td className="border">${prices[index].toFixed(2)}</td>
              <td className="border">${basis[index].toFixed(2)}</td>
              <td className="border">{formatDollars(pnl[index])}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="border"></td>
            <td className="border">${cards.current.stats.monthly}</td>
            <td className="border">${cards.split.stats.monthly}</td>
            <td className="border"></td>
            <td className="border text-right">{formatDollars(sum(net))}</td>
            <td className="border"></td>
            <td className="border"></td>
            <td className="border">{formatDollars(sum(pnl))}</td>
          </tr>
        </tfoot>
      </table>
      {name && (
        <DividendsChart
          name={name}
          next={dividends[names.indexOf(name)].next}
        />
      )}
    </>
  );
}
