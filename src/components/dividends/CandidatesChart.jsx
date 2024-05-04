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

export const colors = {
  candidate: "gray", // default
  goal: "green",
  highlight: "blue",
  split: "red",
};

export default function CandidatesChart({
  cards,
  dims,
  highlight,
  goal,
  split,
  onClick,
  onHover,
}) {
  const getOptions = (x, y) => {
    const getLabel = ({ stats }) => `${stats[y]} vs ${stats[x]}`;
    const getAnnotations = ({ stats }, color) => [
      {
        type: "line",
        mode: "vertical",
        scaleID: "x",
        value: stats[x],
        borderColor: color,
        borderWidth: 1,
      },
      {
        type: "line",
        mode: "horizontal",
        scaleID: "y",
        value: stats[y],
        borderColor: color,
        borderWidth: 1,
      },
    ];

    // only show goal when we're close to the total
    const distance =
      Math.abs(split.stats.total - goal.stats.total) / goal.stats.total;

    return {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: split
            ? `${split.stats[y]} ${y} vs ${split.stats[x]} ${x}`
            : `${y} vs ${x}`,
        },
        tooltip: {
          callbacks: {
            label: ({ dataIndex }) => getLabel(cards[dataIndex]),
          },
        },
        annotation: {
          annotations: [
            ...getAnnotations(split, colors.split),
            ...getAnnotations(goal, colors.goal),
          ],
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
      onHover: (event, elements) => {
        if (elements.length) {
          onHover(cards[elements[0].index]);
        }
      },
    };
    // console.log(options);
  };
  // TODO: consider filtering data here, based on the split
  // TODO: maybe dedupe here by label
  const cashFlowOptions = getOptions("total", "monthly");
  const ratioOptions = getOptions("exp", "roi");

  // TODO: make the dots look pretty
  // TODO: maintain a history of bestNew candidates to highlight by filling them in
  const pointBackgroundColor = ({ dataIndex }) => colors.candidate;
  //highlight && highlight === dataIndex ? colors.highlight : colors.candidate;

  const pointRadius = ({ dataIndex }) => 3;
  //highlight && highlight === dataIndex ? 8 : 3;

  const data = {
    datasets: [
      {
        data: cards.map(({ stats }) => stats),
        backgroundColor: "rgb(255, 99, 132)",
        pointBackgroundColor,
        pointRadius,
      },
    ],
  };

  return (
    <>
      <Scatter options={cashFlowOptions} data={data} />
      <Scatter options={ratioOptions} data={data} />
    </>
  );
}
