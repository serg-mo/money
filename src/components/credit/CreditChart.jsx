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
    plugins: {
      legend: true,
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
      const totalAmount = -1 * sumBy(categoryTransactions, "amount");
      return { category, totalAmount, categoryTransactions };
    },
  );
  categoryTotals.sort((a, b) => b.totalAmount - a.totalAmount); // desc

  const datasets = categoryTotals.map(({ category, categoryTransactions }) => {
    // "2022-08-30" -> "2022-08"
    const months = groupBy(categoryTransactions, (row) =>
      row["date"].substring(0, 7),
    );

    // there needs to be a value for every year-month, even if it's 0
    const data = allMonths.map((month) => ({
      x: month, // year-month
      y: months[month] ? -1 * sumBy(months[month], "amount") : null,
    }));

    return {
      label: category,
      data,
      fill: "start",
      pointStyle: "rect",
      borderColor: COLORS[category],
      backgroundColor: COLORS[category],
    };
  });

  const data = {
    datasets,
  };
  // console.log(data);

  return <Line options={options} data={data} />;
}
