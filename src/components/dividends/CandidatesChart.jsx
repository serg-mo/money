import React, { useState } from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  defaults,
} from "chart.js";
import { Scatter } from "react-chartjs-2";

defaults.font.family = "Monaco";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

export default function CandidatesChart({ cards, x, y, onClick }) {
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `${y} vs ${x}`,
      },
      tooltip: {
        callbacks: {
          label: ({ dataIndex }) => {
            const { stats } = cards[dataIndex];
            return `${stats[y]} vs ${stats[x]}`;
          },
        },
      },
    },
    parsing: {
      xAxisKey: x,
      yAxisKey: y,
    },
    onClick: (event, elements) => {
      if (elements.length) {
        onClick(cards[elements[0].index]);
      }
    },
  };

  const data = {
    datasets: [
      {
        data: cards.map(({ stats }) => stats),
        backgroundColor: "rgb(255, 99, 132)",
        pointBackgroundColor: ({ dataIndex }) =>
          dataIndex === 0 ? "red" : "#CCCCCC", // highlight the first point
        pointRadius: ({ dataIndex }) => (dataIndex === 0 ? 6 : 3),
      },
    ],
  };

  return <Scatter options={options} data={data} />;
}
