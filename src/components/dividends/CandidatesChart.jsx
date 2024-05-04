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

export default function CandidatesChart({ cards, x, y }) {
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
        const { candidate } = cards[elements[0].index];
        // copy values to be pasted into the streadsheet
        const load = async (text) => await navigator.clipboard.writeText(text);
        load(candidate.join("\n"));
      }
    },
  };

  const data = {
    datasets: [
      {
        data: cards.map(({ stats }) => stats),
        backgroundColor: "rgb(255, 99, 132)",
        pointBackgroundColor: ({ dataIndex }) =>
          dataIndex === 0 ? "red" : "blue", // highlight the first point
        pointRadius: 5, // Customize point radius
      },
    ],
  };

  return <Scatter options={options} data={data} />;
}
