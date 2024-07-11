import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
  defaults
} from "chart.js";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { mean } from "../../utils/common";
import { fetchFundDividends } from "../../utils/dividends";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

defaults.font.family = "Monaco";

// TODO: add avg and next lines
export default function DividendsChart({ name, next }) {
  const [dividends, setDividends] = useState([]);

  useEffect(() => {
    fetchFundDividends(name).then(setDividends);
  }, [name]);

  if (!dividends.length) {
    return;
  }

  const values = dividends.map(([timestamp, value]) => value)
  const avg = mean(values).toFixed(4);

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: name,
      },
      legend: {
        display: false,
      },
      annotation: {
        annotations: [
          {
            type: "line",
            mode: "horizontal",
            scaleID: "y",
            value: avg,
            borderColor: "red",
            borderWidth: 1,
          },
          {
            type: "line",
            mode: "horizontal",
            scaleID: "y",
            value: next,
            borderColor: "green",
            borderWidth: 1,
          },
        ],
      },

    },
    animation: false,
  };

  const datasets = [{
    label: name, // this dataset is for a specifc symbol
    data: dividends.map(([timestamp, value]) => ({ x: moment(timestamp).format("YYYY-MM-DD"), y: value.toFixed(4) })),
    borderColor: "gray",
    backgroundColor: "gray",
  }];

  const data = {
    datasets
  };

  return <Bar options={options} data={data} />;
}
