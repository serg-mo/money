import { groupBy, sumBy } from 'lodash';
import React from 'react';
import { BUDGET, COLORS } from '../../utils/credit';

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  defaults,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

defaults.font.family = 'Monaco';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const BUDGET_TOTAL = Object.values(BUDGET).reduce(
  (acc, amount) => acc + amount,
  0
);
const BUDGET_BARE =
  BUDGET_TOTAL - BUDGET['RESTAURANT'] - BUDGET['SHOPPING'] - BUDGET['TRAVEL'];

// TODO: when the tab is set, this should be monthly avg
// TODO: when multiple datasets, this should be the sum of the averages for the visible ones
export default function CreditChart({ transactions, x }) {
  // TODO: only show annotations when showing multiple categories
  // TODO: I should have a file for important dates, like when I moved in and out of SF
  // NOTE: credit card csv only has one year worth of data, which is all I need, really
  const annotations = [
    {
      type: 'line',
      mode: 'horizontal',
      scaleID: 'y',
      label: {
        content: `BUDGET ${BUDGET_TOTAL}`,
        display: true,
        position: 'start',
      },
      value: BUDGET_TOTAL,
      borderColor: 'red',
      borderWidth: 2,
    },
    {
      type: 'line',
      mode: 'horizontal',
      scaleID: 'y',
      label: {
        content: `BARE ${BUDGET_BARE}`,
        display: true,
        position: 'start',
      },
      value: BUDGET_BARE,
      borderColor: 'red',
      borderWidth: 2,
    },
  ];

  const options = {
    responsive: true,
    spanGaps: 3,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: true,
      tooltip: {
        callbacks: {
          label: (item) => {
            const label = item.dataset.label;
            const value = Math.round(item.parsed.y);
            return `${label.padEnd(15)} ${value}`;
          },
          footer: (points) => {
            if (points.length === 1) {
              return;
            }

            const total = points.reduce(
              (acc, point) => acc + point.parsed.y,
              0
            );

            // padding is offset by the color of the dataset
            return `${'TOTAL'.padEnd(17)} ${Math.round(total)}`;
          },
        },
      },
      annotation: {
        // annotations,
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
      position: 'bottom',
    },
  };

  // there needs to be a value for every x, even if it's 0
  const allXs = Object.keys(groupBy(transactions, x));

  // TODO: if there is only a single catagory, then group by NAME, i.e., vendor
  const categories = groupBy(transactions, 'category');

  const categoryTotals = Object.entries(categories).map(
    ([category, categoryTransactions]) => {
      const total = -1 * sumBy(categoryTransactions, 'amount');
      return {
        category,
        total,
        avg: total / allXs.length,
        categoryTransactions,
      };
    }
  );
  // TODO: sort by most recent x
  // categoryTotals.sort((a, b) => b.total - a.total); // desc

  // show datasets in order of COLORS
  const COLORS_ORDER = Object.keys(COLORS);
  categoryTotals.sort(
    (a, b) =>
      COLORS_ORDER.indexOf(a.category) - COLORS_ORDER.indexOf(b.category)
  );

  const datasets = categoryTotals.map(
    ({ category, avg, categoryTransactions }) => {
      const groups = groupBy(categoryTransactions, x);

      // there needs to be a value for every x, even if it's 0
      const data = allXs.map((value) => ({
        x: value,
        y: groups[value] ? -1 * sumBy(groups[value], 'amount') : 0,
      }));

      // TODO: what I want is the sum of averages of visible datasets
      return {
        label: category, // NOTE: dataset name must match category name
        data,
        fill: 'start',
        pointStyle: 'rect',
        hidden: false,
        borderColor: COLORS[category],
        backgroundColor: COLORS[category],
      };
    }
  );

  return <Line options={options} data={{ datasets }} />;
}
