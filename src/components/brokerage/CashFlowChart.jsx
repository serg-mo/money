import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Legend,
  Tooltip,
  defaults,
} from "chart.js";
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
export const COLORS = ["#003f5c", "#58508d", "#bc5090", "#ff6361", "#ffa600"];

const columns = [
  "deposits",
  "withdrawals",
  "market change minus fees",
  "dividends & interest",
];

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

  const datasets = columns.map((column, index) => {
    return {
      label: column,
      data: transactions.map((fields) => fields[column]),
      borderColor: COLORS[index],
      backgroundColor: COLORS[index],
    };
  });

  const data = {
    labels: transactions.map((fields) => fields["month"]),
    datasets: datasets,
  };

  return <Bar options={options} data={data} />;
}
