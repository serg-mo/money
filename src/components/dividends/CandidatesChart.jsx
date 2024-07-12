import React from "react";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Title,
  defaults,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { Scatter } from "react-chartjs-2";

defaults.font.family = "Monaco";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  annotationPlugin,
);

export const colors = {
  candidate: "gray", // default
  goal: "green",
  highlight: "blue",
  split: "red",
};

// TODO: inside the doughnut, show the total and monthly
export default function CandidatesChart({
  cards,
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
        legend: false,
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
  // TODO: make the dots look pretty
  // TODO: maintain a history of bestNew candidates to highlight by filling them in
  // TODO: consider filtering data here, based on the split
  // TODO: maybe dedupe here by label

  const pointBackgroundColor = ({ dataIndex }) =>
    highlight === dataIndex ? colors.highlight : colors.candidate;

  const pointRadius = ({ dataIndex }) => (highlight === dataIndex ? 5 : 3);

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

  // TODO: color code each point on the scatter chart to show similarity to current
  return (
    <>
      <Scatter options={getOptions("total", "monthly")} data={data} />
      {/* <Scatter options={getOptions("exp", "roi")} data={data} /> */}
    </>
  );
}
