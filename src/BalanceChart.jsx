import React, { useState } from "react";

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

export default function BalanceChart({ transactions }) {
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Ending Balance",
      },
    },
  };

  // NOTE: ending balance of one month is the same as the beginning balance of the next one
  const data = {
    labels: transactions.map((fields) => fields["Month"]),
    datasets: [
      {
        data: transactions.map((fields) => fields["Ending Balance"]),
        borderColor: "rgb(100, 100, 100)",
        backgroundColor: "rgba(100, 100, 100, 1)",
      },
    ],
  };

  return <Line options={options} data={data} />;
}
