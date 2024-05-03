import React from "react";
import moment from "moment";
import CreditTransactions from "./CreditTransactions";

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
    const group = transaction["normalizedName"]; // TODO: parse name here
    obj[group] = [...(obj[group] || []), transaction];
    return obj;
  }, {});
  // console.log(summary);

  // last transaction of the recurring transactions grouped by name
  const filtered = Object.values(summary)
    .filter(isMonthly)
    .map((group) => group[group.length - 1]);

  // TODO: bring back the total in the header or the footer
  /*
  const total = Object.values(filtered).reduce(
    (carry, t) => carry + t["amount"],
    0,
  );
  */

  return <CreditTransactions title="Recurring" transactions={filtered} />;
}
