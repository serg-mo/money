import React from 'react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  plugins: {
    title: {
      display: true,
      text: "Line Chart",
    },
  },
  elements: {
    line: {
      tension: 0.2, // bezier curve
    },
  },
};

export default function LineChart({ data }) {
  return (
    <div>
      <Line options={options} data={data} />
    </div>
  );
}