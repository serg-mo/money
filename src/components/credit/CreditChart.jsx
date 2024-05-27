import React, { useContext } from "react";
import { groupBy, sumBy } from "lodash";
import { COLORS } from "../../utils/credit";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  defaults,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { CreditContext } from "../../utils/credit";

defaults.font.family = "Monaco";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
);

const titles = ["Date", "Transaction", "Name", "Memo", "Amount"];

export default function CreditChart({ transactions }) {
  const options = {
    responsive: true,
    spanGaps: 3,
    interaction: {
      intersect: false,
      mode: "index",
    },
    plugins: {
      legend: true,
      tooltip: {
        callbacks: {
          footer: (points) => {
            const total = points.reduce(
              (acc, point) => acc + point.parsed.y,
              0,
            );

            // TODO: add avg here too
            return `TOTAL: ${total.toFixed(2)}`;
          },
        },
      },
    },
    elements: {
      line: {
        tension: 0.3, // smooth lines
      },
    },
    scales: {
      x: { stacked: false }, // must be false
      y: { stacked: true },
    },
    animation: {
      duration: 0, // milliseconds
    },
    elements: {
      line: {
        tension: 0.2, // bezier curve
        borderWidth: 0,
      },
    },
    legend: {
      position: "bottom",
    },
  };

  const allMonths = Object.keys(
    groupBy(transactions, (row) => row["date"].substring(0, 7)), // year-month
  );
  const categories = groupBy(transactions, (row) => row["category"]);

  const categoryTotals = Object.entries(categories).map(
    ([category, categoryTransactions]) => {
      const total = -1 * sumBy(categoryTransactions, "amount");
      return {
        category,
        total,
        avg: total / allMonths.length,
        categoryTransactions,
      };
    },
  );
  categoryTotals.sort((a, b) => b.total - a.total); // desc

  const datasets = categoryTotals.map(
    ({ category, avg, categoryTransactions }) => {
      // "2022-08-30" -> "2022-08"
      const months = groupBy(categoryTransactions, (row) =>
        row["date"].substring(0, 7),
      );

      // there needs to be a value for every year-month, even if it's 0
      const data = allMonths.map((month) => ({
        x: month, // year-month
        y: months[month] ? -1 * sumBy(months[month], "amount") : null,
      }));

      // TODO: what I want is the sum of averages of visible datasets
      return {
        label: `${category} \$${avg.toFixed(2)}/mo`,
        data,
        fill: "start",
        pointStyle: "rect",
        hidden: true,
        borderColor: COLORS[category],
        backgroundColor: COLORS[category],
      };
    },
  );

  const data = {
    datasets,
  };
  // console.log(data);

  return <Line options={options} data={data} />;
}
