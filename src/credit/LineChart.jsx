import React, { useState } from "react";
import { CHART_COLORS } from "../utils";
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
import { groupBy, sumBy } from "lodash";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
);

const titles = ["Date", "Transaction", "Name", "Memo", "Amount"];

export default function LineChart({ transactions }) {
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Debits",
      },
    },
  };

  // "2022-08-30" -> "2022-08"
  const groups = groupBy(transactions, (row) => row["Date"].substring(0, 7));

  const data = {
    labels: Object.keys(groups), // year-month
    datasets: [
      {
        data: Object.values(groups).map(
          (subset) => -1 * sumBy(subset, "Amount"),
        ),
        borderColor: CHART_COLORS["one"],
        backgroundColor: CHART_COLORS["two"],
      },
    ],
  };

  console.log(data);

  return <Line options={options} data={data} />;
}
