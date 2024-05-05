import React, { useContext } from "react";
import { DividendContext } from "../../utils/dividends";
import { Chart as ChartJS, ArcElement, Tooltip, defaults } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip);

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

// TODO: come up with a color for each fund
// TODO: these should be stacked, so I can see the relative difference
export default function CandidateChart({ card: { candidate }, title }) {
  const { names } = useContext(DividendContext);

  const options = {
    responsive: true,
    tooltips: {
      enabled: false,
    },
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  const data = {
    labels: names,
    datasets: [
      {
        data: candidate,
        backgroundColor: "rgb(255, 99, 132)",
      },
    ],
  };

  return <Pie options={options} data={data} />;
}
