import React, { useState } from "react";
import { groupBy, sumBy } from "lodash";
import { COLORS, CATEGORIES } from "../../utils/credit";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  defaults,
} from "chart.js";
import { Bar } from "react-chartjs-2";

defaults.font.family = "Monaco";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

const titles = ["Date", "Transaction", "Name", "Memo", "Amount"];

export default function CreditChart({ transactions }) {
  const options = {
    responsive: true,
    plugins: {},
    scales: {
      x: { stacked: true },
      y: { stacked: true },
    },
  };

  // "2022-08-30" -> "2022-08"
  const groups = groupBy(transactions, (row) => row["date"].substring(0, 7));

  const data = {
    labels: Object.keys(groups), // year-month
    datasets: [
      {
        data: Object.values(groups).map(
          (subset) => -1 * sumBy(subset, "amount"),
        ),
        borderColor: COLORS[CATEGORIES.UNCLASSIFIED],
        backgroundColor: COLORS[CATEGORIES.UNCLASSIFIED],
      },
    ],
  };
  // console.log(data);

  return <Bar options={options} data={data} />;
}
