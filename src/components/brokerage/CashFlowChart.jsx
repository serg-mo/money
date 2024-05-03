import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  defaults,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

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

export default function CashFlowChart({ transactions, title, columns }) {
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: title,
      },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true },
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
