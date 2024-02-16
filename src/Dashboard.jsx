import LineChart from "./LineChart";
import BarChart from "./LineChart";

function Dashboard({ transactions }) {
  // console.log(transactions);

  if (!transactions.length) {
    return;
  }

  const data = {
    labels: transactions.map((fields) => fields["Month"]),
    datasets: [
      {
        label: "Dataset",
        data: transactions.map((fields) => fields["Withdrawals"]),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  //       <LineChart data={data} />

  return (
    <div>
      <BarChart data={data} />
    </div>
  );
}

export default Dashboard;
