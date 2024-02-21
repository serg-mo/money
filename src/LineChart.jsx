import React from "react";
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

export default function LineChart({ title, data }) {
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: title,
      },
    },
    elements: {
      line: {
        tension: 0.2, // bezier curve
      },
    },
  };

  return <Line options={options} data={data} />;
}
