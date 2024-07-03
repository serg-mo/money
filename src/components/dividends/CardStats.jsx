import React from "react";

export default function CardStats({ cards }) {
  return (
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
  );
}
