import React, { useState } from "react";
import ScrollList from "./ScrollList";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
);

// same columns for brokerage and checking
const titles = [
  // "Month",
  "Beginning Balance",
  "Market Change Minus Fees",
  "Dividends & Interest",
  "Deposits",
  "Withdrawals",
  "Ending Balance",
];

export default function LineChart({ transactions }) {
  const xColumn = "Month";
  const [yColumn, setYColumn] = useState("Withdrawals");

  const options = {
    responsive: true,
    plugins: {},
    elements: {
      line: {
        tension: 0.2, // bezier curve
      },
    },
  };

  const data = {
    labels: transactions.map((fields) => fields[xColumn]),
    datasets: [
      {
        label: yColumn,
        data: transactions.map((fields) => fields[yColumn]),
        borderColor: "rgb(100, 100, 100)",
        backgroundColor: "rgba(100, 100, 100, 1)",
      },
    ],
  };

  return (
    <div>
      <ScrollList options={titles} value={yColumn} onChange={setYColumn} />
      <Line options={options} data={data} />
    </div>
  );
}
