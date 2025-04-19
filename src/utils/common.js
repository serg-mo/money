export function loadFileContent(file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

export function parseCSV(
  txt,
  rowRegx = /\r?\n/,
  colRegx = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/, // ignore commas within double quotes
  replaceRegx = /[\",\$%]/g
) {
  return txt
    .split(rowRegx)
    .map((row) =>
      row.split(colRegx).map((v) => v.replace(replaceRegx, '').trim())
    );
}

export function rowToObjectWithKeys(keys) {
  return (row) => {
    return Object.fromEntries(keys.map((key, index) => [key, row[index]]));
  };
}

export function isMatchingFile(txt, required, headerIndex = 0) {
  const lines = parseCSV(txt);
  const headers = lines[headerIndex].map((v) => v.toLowerCase());

  return required.every((col) => headers.includes(col));
}

export function getColorTransparencies(color, length) {
  let rgba = color.match(/\d+/g);

  let palette = [];
  for (let i = 0; i < length; i++) {
    rgba[rgba.length - 1] = Math.round((100 * (length - i)) / length) / 100; // alpha 1 .. 0
    palette.push(`rgba(${rgba.join(',')})`);
  }
  return palette;
}

export function sum(arr) {
  return arr.reduce((acc, val) => acc + val, 0);
}

export function mean(arr) {
  return sum(arr) / arr.length;
}

export function singleArrayProduct(arr) {
  return arr.reduce((acc, val) => acc * val, 1);
}

export function arrayProduct(...arrays) {
  const size = arrays[0].length;

  if (!arrays.every((arr) => arr.length === size)) {
    throw new Error('All arrays must be of the same length');
  }

  let result = [];
  for (let i = 0; i < size; i++) {
    result.push(singleArrayProduct(arrays.map((arr) => arr[i])));
  }
  return result;
}

export function arrayDifference(a, b) {
  if (a.length !== b.length) {
    throw new Error('Arrays must be of the same length');
  }

  return a.map((value, index) => value - b[index]);
}

export function sumProduct(...arrays) {
  const size = arrays[0].length;

  if (!arrays.every((arr) => arr.length === size)) {
    throw new Error('All arrays must be of the same length');
  }

  let sum = 0;
  for (let i = 0; i < size; i++) {
    let product = 1;
    for (let j = 0; j < arrays.length; j++) {
      product *= parseFloat(arrays[j][i]);
    }
    sum += parseFloat(product.toFixed(32));
  }
  return sum;
}
