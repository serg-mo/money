import LineChart from "./LineChart";
import BarChart from "./BarChart";

export default function Dashboard({ transactions }) {
  // console.log(transactions);

  if (!transactions.length) {
    return;
  }

  const lineData = {
    labels: transactions.map((fields) => fields["Month"]),
    datasets: [
      {
        label: "Dataset", // TODO: derive this
        data: transactions.map((fields) => fields["Withdrawals"]),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  const barData = {
    labels: transactions.map((fields) => fields["Month"]),
    datasets: [
      {
        label: "Dataset", // TODO: derive this
        data: transactions.map((fields) => fields["Withdrawals"]),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  return (
    <div>
      <LineChart data={lineData} />
      <BarChart data={barData} />
    </div>
  );
}