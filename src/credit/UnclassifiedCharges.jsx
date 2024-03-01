import React from "react";

export default function UnclassifiedCharges({ transactions }) {
  const filtered = transactions.filter((t) => t["Category"] === "OTHER");

  return (
    <table className="w-max mx-auto">
      <thead>
        <tr>
          <th colSpan="2" className="text-center">
            Unclassified ({filtered.length})
          </th>
        </tr>
      </thead>
      <tbody>
        {filtered.map((t, key) => (
          <tr key={key}>
            <td>
              {t["Name"]} {t["Amount"]}
            </td>
            <td>{t["Category"]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
