import React from "react";
import moment from "moment";
import CreditTransaction from "./CreditTransaction";

function isMonthly(transactions) {
  if (transactions.length <= 2) {
    return false;
  }

  const months = transactions.map((row) =>
    moment(row["date"]).format("YYYY-MM"),
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
    const group = transaction["name"];
    obj[group] = [...(obj[group] || []), transaction];
    return obj;
  }, {});
  // console.log(summary);

  const filtered = Object.entries(summary).reduce(
    (obj, [key, transactions]) => {
      if (isMonthly(transactions)) {
        obj[key] = transactions[transactions.length - 1];
      }
      return obj;
    },
    {},
  );

  const total = Object.values(filtered).reduce(
    (carry, t) => carry + t["amount"],
    0,
  );

  // TODO: this is the same as CreditTransactions, except with a total
  return (
    <table className="w-full mx-auto">
      <thead>
        <tr>
          <th colSpan={3}>Recurring ({Object.keys(filtered).length})</th>
        </tr>
        <tr>
          <th>Name</th>
          <th>Amount</th>
          <th>Category</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(filtered).map(([key, last]) => (
          <CreditTransaction key={key} {...last} />
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={2} className="text-right">
            TOTAL
          </td>
          <td>{total}</td>
        </tr>
      </tfoot>
    </table>
  );
}
