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
export default function DividendsChart({ name }) {
    const [dividends, setDividends] = useState([]);

    useEffect(() => {
        fetchFundDividends(name).then(setDividends);
    }, [name]);

    if (!dividends.length) {
        return;
    }

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
        },
        animation: false,
    };

    const datasets = [{
        label: name, // this dataset is for a specifc symbol
        data: dividends.map(([timestamp, value]) => ({ x: moment(timestamp).format("YYYY-MM-DD"), y: value.toFixed(4) })),
        borderColor: "#003f5c",
        backgroundColor: "#58508d",
    }];

    const data = {
        datasets,
    };

    return <Bar options={options} data={data} />;
}
