import React, { useState, useEffect } from "react";
import LineChart from "./LineChart";

const titles = [
  // "Month",
  "Beginning Balance",
  "Market Change Minus Fees",
  "Dividends & Interest",
  "Deposits",
  "Withdrawals",
  "Ending Balance",
];

// TODO: accept files and parse transactions for each
export default function Dashboard({ transactions }) {
  const xColumn = "Month"
  const [yColumn, setYColumn] = useState("Withdrawals");

  if (!transactions.length) {
    return;
  }

  const data = {
    labels: transactions.map((fields) => fields[xColumn]),
    datasets: [
      {
        label: "Dataset", // TODO: derive this
        data: transactions.map((fields) => fields[yColumn]),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  return (
    <div>
      <LineChart data={data} />
    </div>
  );
}
