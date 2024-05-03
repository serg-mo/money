export function parseCSV(str) {
  return str.split('","').map((one) => one.replace(/^"|"$/g, ""));
}

export function parseBrokerageFile(txt) {
  const lines = txt.split(/\r?\n/);
  const header = lines.slice(0, 4); // title, account, date range, headers
  const middle = lines.slice(4, lines.length - 8);
  const headers = parseCSV(header[3]);
  // const tail = lines.slice(lines.length - 8); // blank, report date, 6 lines of junk

  return parseTransactions(middle, headers);
}

export function parseTransactions(lines, headers) {
  return lines.map(parseCSV).map((fields) => {
    return headers.reduce((obj, header, index) => {
      let value = "";

      // reformat first field, "MMM YYYY" -> "MMM YY"
      if (index === 0) {
        value = fields[index].slice(0, 3) + " " + fields[index].slice(-2); // e.g., Jan 22
      } else {
        value = parseFloat(fields[index].replace(/[$,]/g, ""));
      }

      return { ...obj, [header]: value };
    }, {});
  });
}
