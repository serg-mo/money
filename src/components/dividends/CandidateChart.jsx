import React, { useContext } from "react";
import { DividendContext } from "../../utils/dividends";
import { Chart as ChartJS, ArcElement, Tooltip, defaults } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { arrayProduct } from "../../utils/dividends";

// https://chartjs-plugin-datalabels.netlify.app/samples/charts/doughnut.html
ChartJS.register(ArcElement, Tooltip /*ChartDataLabels*/);

defaults.font.family = "Monaco";

// export function CandidateStats({ monthly, total, roi, exp, ratio }) {
//   return (
//     <div>
//       <p>{`${monthly.toFixed(0)}/mo @ ${(total / 1000).toFixed(2)}k`}</p>
//       <p>{roi && exp ? `${roi}/${exp}=${ratio}` : ratio}</p>
//     </div>
//   );
// }

// export function CandidateCardOld({ candidate, stats }) {
//   // copy values to be pasted into the streadsheet
//   const load = async (text) => await navigator.clipboard.writeText(text);
//   const onClick = candidate ? () => load(candidate.join("\n")) : undefined;

//   return (
//     <div
//       className="max-w-44 min-w-min select-none bg-gray-100 shadow-md rounded-md p-2 cursor-pointer hover:bg-gray-200"
//       onClick={onClick}
//     >
//       <CandidateStats {...stats} />
//     </div>
//   );
// }

const COLORS = [
  "#2b50b6", // DIV
  "#5578b5", // DIVO
  "#829caf", // JEPI
  "#b3bfa3", // NUSI
  "#e5e08f", // QYLD
  "#ffe892", // RYLD
  "#fed6af", // SDIV
  "#fdc2c7", // SPHD
  "#fcaedd", // SRET
  "#fa97f0", // XYLD
];

// TODO: compute the similar colors for the split and current
// TODO: add the similiarity to the middle of the doughnut chart
// https://quickchart.io/documentation/chart-js/custom-pie-doughnut-chart-labels/#using-the-doughnutlabel-plugin

// TODO: come up with a color for each fund
// TODO: these should be stacked, so I can see the relative difference
export default function CandidateChart({ current, split }) {
  const { names, prices } = useContext(DividendContext);

  const options = {
    responsive: true,
    tooltips: {
      enabled: false,
    },
    plugins: {
      legend: false,
      ChartDataLabels,
    },
    animation: false,
  };

  // old options
  // let options = {
  //   cutoutPercentage: 45,
  //   rotation: 10,
  //   animation: {
  //     duration: 1000, // miliseconds
  //     animateRotate: false,
  //     animateScale: false,
  //   },
  //   title: {
  //     text: "",
  //     display: true,
  //   },
  //   legend: {
  //     position: "left",
  //   },
  // };

  const data = {
    labels: names,
    datasets: [
      {
        label: "current",
        data: arrayProduct(current.candidate, prices),
        backgroundColor: COLORS,
      },
      {
        label: "split",
        data: arrayProduct(split.candidate, prices),
        backgroundColor: COLORS,
      },
    ],
  };

  return <Doughnut options={options} data={data} />;
}
