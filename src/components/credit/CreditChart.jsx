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
    // TODO: stacking does not seem right
    scales: {
      x: { stacked: true },
      y: { stacked: true },
    },
  };

  // old stacked chart
  // // stacked axes can not be changed later
  // let options = {
  //   scales: {
  //     yAxes: [
  //       {
  //         stacked: true,
  //         ticks: {
  //           callback: ticks_callback,
  //         },
  //       },
  //     ],
  //   },
  //   animation: {
  //     duration: 0, // milliseconds
  //   },
  //   title: {
  //     text: "",
  //     display: true,
  //   },
  //   legend: {
  //     position: "bottom",
  //   },
  //   elements: {
  //     line: {
  //       tension: 0.2, // bezier curve
  //       borderWidth: 0,
  //       borderColor: "rgba(0, 0, 0, 0)",
  //     },
  //   },
  // };
  // //console.log("make_stack()", summary, datasets, labels)

  // let data = make_data_multiple(summary, labels); // TODO: pass primary color
  // // TODO: consider adding average datasets here

  const allMonths = Object.keys(
    groupBy(transactions, (row) => row["date"].substring(0, 7)), // year-month
  );
  const categories = groupBy(transactions, (row) => row["category"]);

  const datasets = Object.entries(categories).map(
    ([category, categoryTransactions]) => {
      // "2022-08-30" -> "2022-08"
      const months = groupBy(categoryTransactions, (row) =>
        row["date"].substring(0, 7),
      );

      // there needs to be a value for every year-month, even if it's 0
      const data = allMonths.map((month) => ({
        x: month, // year-month
        y: months[month] ? -1 * sumBy(months[month], "amount") : 0,
      }));

      return {
        label: category,
        data,
        fill: "start",
        borderColor: COLORS[category],
        backgroundColor: COLORS[category],
      };
    },
  );

  console.log(datasets);

  const data = {
    datasets,
  };
  // console.log(data);

  return <Line options={options} data={data} />;
}
