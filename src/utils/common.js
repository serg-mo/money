export function loadFileContent(file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

// copy-pasted spreadsheets are tab separated
async function parseClipboard() {
  await navigator.clipboard.readText();
}

// ignore commas within double quotes
export function splitCells(
  txt,
  rowRegx = /\r?\n/,
  colRegx = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/,
  replaceRegx = /[\",\$%]/g,
) {
  return txt
    .split(rowRegx)
    .map((row) =>
      row.split(colRegx).map((v) => v.replace(replaceRegx, "").trim()),
    );
}

export function rowToObjectWithKeys(keys) {
  return (row) => {
    return Object.fromEntries(keys.map((key, index) => [key, row[index]]));
  };
}

function get_palette(base_color, length) {
  let rgba = base_color.match(/\d+/g);
  let palette = [];

  for (let i = 0; i < length; i++) {
    rgba[rgba.length - 1] = Math.round((100 * (length - i)) / length) / 100; // alpha 1 .. 0
    palette.push(`rgba(${rgba.join(",")})`);
  }
  return palette;
}
