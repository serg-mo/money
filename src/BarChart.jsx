import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

export default function BarChart({ title, data }) {
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: title,
      },
    },
  };

  return <Bar options={options} data={data} />;
}
