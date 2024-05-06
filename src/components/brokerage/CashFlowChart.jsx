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

export const COLORS = [
  "rgba(153, 102, 255)",
  "rgba(255, 159, 64)",
  "rgba(255, 99, 132)",
  "rgba(54, 162, 235)",
  "rgba(255, 206, 86)",
  "rgba(75, 192, 192)",
  "rgba(153, 102, 255)",
  "rgba(255, 159, 64)",
];

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
        labels: {
          color: "rgb(255, 99, 132)",
        },
      },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true },
    },
    animation: false,
    legend: {
      display: true,
    },
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
