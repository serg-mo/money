import React, { useContext } from "react";
import {
  DividendContext,
  arrayDifference,
  arrayProduct,
  arraySum,
} from "../../utils/dividends";

export default function CardStats({ cards }) {
  const { names, dividends, prices } = useContext(DividendContext);

  const nextDividends = arrayProduct(cards.split.candidate, dividends);
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
              {Object.values(card.stats).map((value) => (
                <td key={value} className="border">
                  {value > 0 ? value : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <table className="border-collapse border-gray-900 table-auto m-auto">
        <thead>
          <tr>
            <th>Name</th>
            <th>Next Dividend</th>
            <th>Order</th>
            <th>Cost</th>
          </tr>
        </thead>
        <tbody>
          {names.map((name, index) => (
            <tr key={index}>
              <td className="border">{name}</td>
              <td className="border">${dividends[index]}</td>
              <td className="border">{orders[index]}</td>
              <td className="border">${costs[index].toFixed()}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="border"></td>
            <td className="border">${arraySum(nextDividends).toFixed()}</td>
            <td className="border"></td>
            <td className="border">${arraySum(costs).toFixed()}</td>
          </tr>
        </tfoot>
      </table>
    </>
  );
}
