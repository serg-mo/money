export function parseCSV(str) {
  return str.split('","').map((one) => one.replace(/^"|"$/g, ""));
}

export function parseBrokerageFile(txt) {
  const lines = txt.split(/\r?\n/);
  const header = lines.slice(0, 4); // title, account, date range, headers
  const middle = lines.slice(4, lines.length - 8);
  const headers = parseCSV(header[3]).map((s) => s.toLowerCase());
  // const tail = lines.slice(lines.length - 8); // blank, report date, 6 lines of junk

  return parseTransactions(middle, headers);
}

export function parseTransactions(lines, headers) {
  const makeTransaction = (values) => {
    let combo = values.reduce((obj, value, index) => {
      if (index !== 0) {
        value = parseFloat(value.replace(/[$,]/g, ""));
      }
      return { ...obj, [headers[index]]: value };
    }, {});

    // example: "Nov 01 - Nov 30 2020"
    combo["date"] = combo["month"].slice(-11); // e.g., Nov 30 2020
    combo["time"] = new Date(combo["date"]).getTime(); // milliseconds since epoch
    combo["month"] = combo["date"].slice(0, 3) + " " + combo["date"].slice(-2); // e.g., Jan 22
    combo["withdrawals"] = -combo["withdrawals"];

    return combo;
  };

  return lines.map(parseCSV).map(makeTransaction);
}
