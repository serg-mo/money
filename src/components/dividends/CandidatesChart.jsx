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
import annotationPlugin from "chartjs-plugin-annotation";

defaults.font.family = "Monaco";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  annotationPlugin,
);

export default function CandidatesChart({ cards, dims, split, onClick }) {
  // TODO: consider filtering data here, based on the split
  const [x, y] = dims; // order is relevant

  const annotations = [
    split.stats[x] && {
      type: "line",
      mode: "vertical",
      scaleID: "x",
      value: split.stats[x],
      borderColor: "red",
      borderWidth: 1,
    },
    split.stats[y] && {
      type: "line",
      mode: "horizontal",
      scaleID: "y",
      value: split.stats[y],
      borderColor: "red",
      borderWidth: 1,
    },
  ];

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
      annotation: {
        annotations,
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
