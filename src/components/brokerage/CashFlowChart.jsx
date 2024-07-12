import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
  defaults,
} from "chart.js";
import React from "react";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

defaults.font.family = "Monaco";

// https://colorkit.co/color-palette-generator
// NOTE: this is a subset of REQUIRED_COLS from src/utils/brokerage.js
const columnColors = {
  "deposits": "#003f5c",
  "withdrawals": "#58508d",
  "market change minus fees": "#bc5090",
  "dividends & interest": "#ff6361",
};

export default function CashFlowChart({ transactions, title }) {
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: title,
      },
      legend: {
        display: true,
      },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true },
    },
    animation: false,
  };

  const datasets = Object.entries(columnColors).map(([name, color]) => {
    return {
      label: name,
      data: transactions.map((fields) => fields[name]),
      borderColor: color,
      backgroundColor: color,
    };
  });

  const data = {
    labels: transactions.map((fields) => fields["month"]),
    datasets: datasets,
  };

  return <Bar options={options} data={data} />;
}
