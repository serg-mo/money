import React from "react";
import moment from "moment";

function isMonthly(transactions) {
  if (transactions.length <= 2) {
    return false;
  }

  const months = transactions.map((row) =>
    moment(row["Date"]).format("YYYY-MM"),
  );
  const [first, last] = [months[0], months[months.length - 1]];

  const expected = [];
  for (let i = moment(first); i <= moment(last); ) {
    expected.push(i.format("YYYY-MM"));
    i = i.add(1, "months");
  }

  // NOTE: comparing distance between first and last to count is not reliable
  // console.log([first, last, JSON.stringify(months), JSON.stringify(expected)]);

  // there is a transaction for every month between the first and last
  return JSON.stringify(months) === JSON.stringify(expected);
}

export default function RecurringCharges({ transactions }) {
  // name => transactions
  const summary = transactions.reduce((obj, transaction) => {
    const group = transaction["Name"];
    obj[group] = [...(obj[group] || []), transaction];
    return obj;
  }, {});
  // console.log(summary);

  const filtered = Object.entries(summary).reduce(
    (obj, [key, transactions]) => {
      if (isMonthly(transactions)) {
        const last = transactions[transactions.length - 1];
        obj[key] = last["Amount"];
      }
      return obj;
    },
    {},
  );

  const total = Object.values(filtered).reduce(
    (carry, value) => carry + value,
    0,
  );

  return (
    <table className="w-max mx-auto">
      <thead>
        <tr>
          <th colSpan="2" className="text-center">
            Recurring ({Object.keys(filtered).length})
          </th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(filtered).map(([key, last]) => (
          <tr key={key}>
            <td>{key}</td>
            <td>{last}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td className="text-right">TOTAL</td>
          <td>{total}</td>
        </tr>
      </tfoot>
    </table>
  );
}
