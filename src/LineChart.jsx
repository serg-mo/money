import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

function LineChart({ data }) {
  const options = {
    responsive: true,
    plugins: {},
    elements: {
      line: {
        tension: 0.2, // bezier curve
      },
    },
  };

  /*
  let options = {
    scales: {
      yAxes: [
        {
          stacked: true,
          ticks: {
            callback: ticks_callback,
          },
        },
      ],
    },
    animation: {
      duration: 0, // milliseconds
    },
    title: {
      text: "",
      display: true,
    },
    legend: {
      position: "bottom",
    },
    elements: {
      line: {
        tension: 0.2, // bezier curve
        borderWidth: 0,
        borderColor: "rgba(0, 0, 0, 0)",
      },
    },
  };
  */

  return <Line options={options} data={data} />;
}

export default LineChart;
