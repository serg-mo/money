import React, { useContext } from "react";
import {
  DividendContext,
  arrayDifference,
  arrayProduct,
  arraySum,
} from "../../utils/dividends";

export default function CardStats({ cards }) {
  const { names, dividends, prices } = useContext(DividendContext);

  const nextDividends = {
    last: arraySum(arrayProduct(cards.split.candidate, dividends.map((d) => d.last))),
    avg: arraySum(arrayProduct(cards.split.candidate, dividends.map((d) => d.avg))),
    next: arraySum(arrayProduct(cards.split.candidate, dividends.map((d) => d.next))),
  }

  const orders = arrayDifference(
    cards.split.candidate,
    cards.current.candidate,
  );
  const costs = arrayProduct(orders, prices);

  return (
    <>
      <table className="border-collapse border-gray-900 table-auto  m-auto">
        <thead>
          <tr>
            <th></th>
            {Object.keys(cards.current.stats).map((key) => (
              <th key={key} className="border">
                {key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(cards).map(([name, card]) => (
            <tr key={name}>
              <td className="border">{name}</td>
              {Object.values(card.stats).map((value, index) => (
                <td key={index} className="border">
                  {value > 0 ? value : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <br />

      <table className="border-collapse border-gray-900 table-auto m-auto">
        <thead>
          <tr>
            <th>Name</th>
            <th>Last</th>
            <th>Avg</th>
            <th>Next</th>
            <th>Order</th>
            <th>Cost</th>
          </tr>
        </thead>
        <tbody>
          {names.map((name, index) => (
            <tr key={index}>
              <td className="border">{name}</td>
              <td className="border">${dividends[index].last}</td>
              <td className="border">${dividends[index].avg}</td>
              <td className="border">${dividends[index].next}</td>
              <td className="border">{orders[index]}</td>
              <td className="border">${costs[index].toFixed()}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="border"></td>
            <td className="border">${nextDividends.last.toFixed()}</td>
            <td className="border">${nextDividends.avg.toFixed()}</td>
            <td className="border">${nextDividends.next.toFixed()}</td>
            <td className="border"></td>
            <td className="border">${arraySum(costs).toFixed()}</td>
          </tr>
        </tfoot>
      </table>
    </>
  );
}
