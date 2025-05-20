import annotationPlugin from 'chartjs-plugin-annotation';
import { groupBy, sumBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import { COLORS } from '../../utils/credit';

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
  Legend,
  annotationPlugin
);

function formatNumber(n) {
  return n > 1_000 ? Math.round(n / 100) / 10 + 'k' : Math.round(n);
}

function makeAnnotation(total, avg, timeResolution, borderColor = 'blue') {
  // TODO: this would be a good place to figure out a static max for the y axis
  const parts = [
    `TOTAL ${formatNumber(total)}`,
    `AVG ${formatNumber(avg)}/${timeResolution}`,
  ];

  return {
    type: 'line',
    mode: 'horizontal',
    scaleID: 'y',
    label: {
      content: parts.join(', '),
      display: true,
      position: 'start',
    },
    value: avg,
    borderColor, // COLORS[tab] || 'blue',
    borderWidth: 1,
  };
}

// TODO: when I click on a date, scroll to the first transaction with that date
export default function CreditChart({
  transactions,
  timeResolution,
  groupByKey,
}) {
  // TODO: derive these based on date math, not groupBy, e.g., 13 unique months in 12 month span
  // there needs to be a value for every x (date column), even if it's 0
  const allXs = Object.keys(groupBy(transactions, timeResolution));
  const [annotations, setAnnotations] = useState([]);

  useEffect(() => {
    // TODO: this counts all datasets, including the hidden ones
    const total = transactions.reduce((prev, { amount }) => prev - amount, 0); // amounts are negative
    const avg = total / allXs.length;
    // console.log({ x, allXs, total, avg })

    setAnnotations(() => [makeAnnotation(total, avg, timeResolution)]);
  }, [transactions, timeResolution]);

  // NOTE: credit card csv only has one year worth of data, which is all I need, really
  const categories = groupBy(transactions, groupByKey);

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

  const COLORS_ORDER = Object.keys(COLORS);

  categoryTotals.sort(
    (a, b) =>
      COLORS_ORDER.indexOf(a.category) - COLORS_ORDER.indexOf(b.category)
  );

  // must go above options
  const datasets = categoryTotals.map(
    ({ category, avg, categoryTransactions }) => {
      const groups = groupBy(categoryTransactions, timeResolution);

      // there needs to be a value for every x, even if it's 0
      const data = allXs.map((value) => ({
        x: value,
        y: groups[value] ? -1 * sumBy(groups[value], 'amount') : 0,
      }));

      // TODO: what I want is the sum of averages of visible datasets
      return {
        label: category, // NOTE: each category is a separate dataset
        data,
        fill: 'start',
        pointStyle: 'rect',
        hidden: false,
        borderColor: COLORS[category],
        backgroundColor: COLORS[category],
      };
    }
  );

  const options = {
    responsive: true,
    spanGaps: 3,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      tooltip: {
        itemSort: (a, b) => a.parsed.y - b.parsed.y, // asc total
        callbacks: {
          label: (item) => {
            const label = item.dataset.label.substring(0, 14);
            const value = Math.round(item.parsed.y);
            return value ? `${label.padEnd(15)} ${value}` : '';
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
      annotation: { annotations },
      legend: {
        onClick: (_, { datasetIndex }, { chart }) => {
          chart.getDatasetMeta(datasetIndex).hidden =
            !chart.getDatasetMeta(datasetIndex).hidden;

          const visibleData = chart.data.datasets
            .filter((_, i) => !chart.getDatasetMeta(i).hidden)
            .map((dataset) => dataset.data)
            .flat();

          const total = Math.round(
            visibleData.reduce((sum, { y }) => sum + y, 0)
          );
          const avg = Math.round(total / allXs.length);
          // console.log({ total, avg });

          setAnnotations([makeAnnotation(total, avg, timeResolution)]);
          chart.update();
        },
      },
    },
    scales: {
      x: { stacked: false }, // must be false
      y: {
        stacked: true,
        beginAtZero: true, // must be true
      },
    },
    animation: {
      duration: 0, // milliseconds
    },
    elements: {
      line: {
        tension: 0.3, // bezier curve
        borderWidth: 0,
      },
    },
    legend: {
      position: 'bottom',
    },
    onClick: (_, elements) => {
      if (elements.length > 0) {
        const x = allXs[elements[0].index]; // date on the chart
        console.log(`Clicked on ${x} on the chart`);
        // TODO: scroll to this date in the table
      }
    },
  };

  return <Line options={options} data={{ datasets }} />;
}
