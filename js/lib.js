// http://paletton.com
// https://colorhexa.com


const colors = {
  "Financial": "rgba(23,130,171,1)",
  "Home": "rgba(19,100,134,1)",
  "Food & Drink": "rgba(15,72,101,1)",
  "Transportation": "rgba(13,45,67,1)",
  "Health & Medical": "rgba(235,85,25,1)",
  "Uncategorized": "rgba(206,56,24,1)",
  "Personal": "rgba(230,154,43,1)",
  "Culture": "rgba(233,120,34,1)",
  "Gifts & Donations": "rgba(229,191,53,1)",
  "Sports & Fitness": "rgba(77,152,128,1)",
  "Education": "rgba(145,172,89,1)",
  "Fees": "rgba(176,27,22,1)",
 
  "default": "rgba(200,200,200,1)"
};



Chart.defaults.global.elements.arc.borderWidth       = 0;
Chart.defaults.global.elements.arc.borderColor       = "rgba(0, 0, 0, 0)";
Chart.defaults.global.elements.point.borderWidth     = 0;
Chart.defaults.global.elements.point.backgroundColor = "rgba(0, 0, 0, 0)";
Chart.defaults.global.tooltips.titleFontFamily       = "Monaco"; // fixed space for columns
Chart.defaults.global.tooltips.bodyFontFamily        = "Monaco";
Chart.defaults.global.tooltips.footerFontFamily      = "Monaco";
Chart.defaults.global.tooltips.footerFontStyle       = "normal";
// footerFontStyle: "normal",
Chart.defaults.global.defaultFontFamily              = "Raleway"; // sans-serif;
Chart.defaults.global.defaultFontSize                = 12;

function make_bar(destination, summary, label) {
  let options = {
    scales: {
      yAxes: [{
        stacked: false,
        ticks: {
          callback: ticks_callback
        }
      }],
    },

    legend: {
      display: false,
    },
  };
  //console.log("make_bar()", summary, datasets, labels)

  let data = make_data_single(summary, label); // TODO: pass same color for every bar here
  // data.datasets.map((v) => { v.backgroundColor = colors[0]; }); // TODO: colors[0] 
  add_average(data.datasets);

  return draw(destination, "bar", data, options);
}

function make_pie(destination, summary, label) {
  let options = {
    cutoutPercentage: 45,
    rotation: 10,
    animation: {
      duration: 1000, // miliseconds
      animateRotate: false,
      animateScale: false
    },
    title: {
      text: "",
      display: true,
    },
    legend: {
      position: "left",
    },
  }
  //console.log("make_pie()", summary, datasets, labels)

  let data = null;
  if (summary && label) {
    data = make_data_single(summary, label);
  }

  return draw(destination, "pie", data, options);
}

function make_line(destination, summary, label) {
  // stacked axes can not be changed later
  let options = {
    scales: {
      yAxes: [{
        stacked: false,
        ticks: {
          callback: ticks_callback
        }
      }],
    },
    legend: {
      display: false,
    },
    elements: {
      line: {
        tension: .2, // bezier curve
        borderWidth: 0,
        borderColor: "rgba(0, 0, 0, 0)",
      }
    },
  };
  //console.log("make_line()", summary, datasets, labels)

  return draw(destination, "line", make_data_single(summary, label), options);
}

function make_stack(destination, summary, labels) {
  // stacked axes can not be changed later
  let options = {
    scales: {
      yAxes: [{
        stacked: true,
        ticks: {
          callback: ticks_callback
        }
      }],
    },
    animation: {
      duration: 0 // milliseconds
    },
    title: {
      text: "",
      display: true,
    },
    legend: {
      position: "bottom",
    },
    elements: {
      line: {
        tension: .2, // bezier curve
        borderWidth: 0,
        borderColor: "rgba(0, 0, 0, 0)",
      }
    },
  };
  //console.log("make_stack()", summary, datasets, labels)

  let data = make_data_multiple(summary, labels); // TODO: pass primary color
  // TODO: consider adding average datasets here

  return draw(destination, "line", data, options);
}

function draw(canvas, type, data, options) {
  // http://www.chartjs.org/docs/latest/developers/api.html
  // object properties are copied by reference, so only touch tooltips here
  options.tooltips = {
    mode: "index",
    intersect: (["bar", "pie"].includes(type)),
    callbacks: {
      title: title_callback,
      label: label_callback,
      footer: footer_callback_sum,
    },
    layout: {
      padding: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      }
    }
  };

  let context = canvas.getContext("2d");
  let config = {
    type,
    data,
    options
  };
  let chart = new Chart(context, config);

  return chart;
}


function make_table(table, data) {
  table.html(""); // fresh copy

  let columns = Object.keys(data[0]);
  let sum = 0;
  let avg = 0;

  table.append("<tr><th>" + columns.join("</th><th>") + "</th></tr>")

  data.forEach(function(row) {
    let cells = columns.map((c) => row[c]); // values for known columns
    sum += row[columns[columns.length - 1]]; // last column is the amount

    table.append("<tr><td>" + cells.join("</td><td>") + "</td></tr>")
  });


  // empty rows of the same length
  let sum_row = columns.map(() => "");
  let avg_row = columns.map(() => "");

  sum_row[0] = "SUM";
  sum_row[sum_row.length - 1] = Math.round(sum).toLocaleString();

  avg_row[0] = "AVG";
  avg_row[avg_row.length - 1] = Math.round(sum / data.length).toLocaleString();

  table.append("<tr>" + sum_row.map((v) => `<th>${v}</th>`).join() + "</th></tr>")
  table.append("<tr>" + avg_row.map((v) => `<th>${v}</th>`).join() + "</th></tr>")
}


function add_average(datasets, index = 0) {
  let avg = {
    label: "Average",
    backgroundColor: "#000000",
    type: 'line',
    fill: false,
    data: []
  };
  let sum = datasets[index].data.reduce((a, b) => a + b, 0);

  datasets[index].data.forEach(() => {
    avg.data.push(sum / datasets[index].data.length)
  });

  datasets.push(avg);
}

function add_averages(datasets, index = 0) {
  // TODO: for every stream in the stack, draw a straight line in a separate scale (non stacked)?
}


function ticks_callback(v) {
  return Math.round(v).toLocaleString(); // prepending "$" here changes font
}

function title_callback(items, data) {
  // show the name of the dataset if available
  if (items.length == 0) {
    return "";
  } else {
    return data.labels[items[0].index] || ""; // data.labels[items[0].index];
  }
}

function label_callback(item, data) {
  let category = data.labels[item.index] || "";
  let dataset = data.datasets[item.datasetIndex].label;
  let value = data.datasets[item.datasetIndex].data[item.index];
  //console.log("label_callback()", item, data);
  //console.log(category, dataset, value)

  let parts = [];
  let sum = 0;

  // TODO: percent does not make sense for two datasets in a pie, the way it does for stacks
  if (data.datasets.length > 1) {
    parts[0] = dataset;
    sum = data.datasets.reduce((carry, v) => carry + (v.hidden ? 0 : v.data[item.index]), 0); // visible datasets only
  } else {
    parts[0] = category;
    sum = data.datasets[0].data.reduce((carry, v) => carry + v, 0);
  }
  parts[0] = parts[0].padEnd(25, " ");

  parts.push(Math.round(value).toLocaleString().padEnd(12, " "), Math.round(100 * value / sum) + "%");

  return parts.join("");
}

function footer_callback_sum(items, data) {
  let total   = 0
  let visible = 0;

  if (data.datasets.length == 1) {
    //meta = chart.getDatasetMeta(0);
    //meta.data[datasetIndex].hidden = !hidden; // it's about to be flipped

    data.datasets[0]._meta[0].data.forEach((v, i) => {
      visible += v.hidden ? 0 : data.datasets[0].data[i];
    });

    // add values in the only dataset
    total = data.datasets[0].data.reduce((carry, v) => carry + v, 0);
  } else {
    // add this column across all datasets
    total = items.reduce((carry, v) => carry + data.datasets[v.datasetIndex].data[v.index], 0);
    visible = total; // TODO: this should be different
  }

  // TODO: average month line in a bar chart makes sense (extra line dataset)
  // TODO: average category spending in a pie chart does not make sense (sum is ok)

  total   = Math.round(total);
  visible = Math.round(visible);

  // there is no legend color box, which takes up two spaces
  return " ".repeat(27) + `TOTAL       ${total.toLocaleString()}\n` +
  " ".repeat(27) + `VISIBLE     ${visible.toLocaleString()}`;
}

// TODO: refactor these into one generator that can do both or one at a time
function footer_callback_avg(items, data) {
  let sum = 0;

  // TODO: loop through the other dimension
  if (data.datasets.length == 1) {
    sum += data.datasets[0].data.reduce((a, b) => a + b, 0); // add values in a single dataser
  } else {
    items.forEach(function(v) {
      sum += data.datasets[v.datasetIndex].data[v.index]; // add this column across all datasets
    });
  }

  // TODO: average month line in a bar chart makes sense (extra line dataset)
  // TODO: average category spending in a pie chart does not make sense (sum is ok)

  // there is no legend color box, which takes up two spaces
  return "AVG ".padStart(27, " ") + Math.round(sum / items.length).toLocaleString();
}


// TODO: pass colors here
function make_data(summary, labels) {
  if (typeof labels == "string") {
    return make_data_single(summary, labels);
  } else {
    return make_data_multiple(summary, labels);
  }
}

function make_data_single(summary, label) {
  let length          = Object.values(summary).length;
  let keys            = Object.keys(summary);
  let data            = Object.values(summary);
  let backgroundColor = keys.map((key) => colors[key] || colors['default']);

  return {
    labels: keys,
    datasets: [{
      label, // name of the dataset
      data,
      backgroundColor,
      fill: false
    }]
  };
}

function make_data_multiple(summary, labels) {
  let datasets = [];
  let i = 0;

  // TODO: list datasets by size or alphabetically
  for (dimension in summary) {
    datasets.push({
      "label": dimension,
      "data": labels.map((label) => summary[dimension][label] || 0),
      "backgroundColor": colors[dimension] || colors['default']
    });
  }

  return {
    labels,
    datasets
  };
}


function sort_summary(summary, init = null) {
  arr = Object.entries(summary);
  arr.sort((a, b) => b[1] - a[1]); // biggest to smallest

  let func;
  if (init != null) {
    func = (sum, v) => {
      sum[v[0]] = init;
      return sum;
    };
  } else {
    func = (sum, v) => {
      sum[v[0]] = v[1];
      return sum;
    };
  }

  return arr.reduce(func, {});
}

function single_reducer(group, aggregate = "amount") {
  return (sum, v) => {
    sum[v[group]] = (sum[v[group]] || 0) + v[aggregate];
    return sum;
  }
}

function double_reducer(group_a, group_b, aggregate = "amount") {
  return (sum, val) => {
    sum[val[group_a]] = sum[val[group_a]] || {};
    sum[val[group_a]][val[group_b]] = (sum[val[group_a]][val[group_b]] || 0) + val[aggregate];

    return sum;
  }
}

function sync_dataset_property(destination, source, property = "hidden") {
  // stack has datasets per category, e.g., rent, food, gym
  // pie has one dataset with categories as labels

  // if the destination has no datasets or source / destination datasets are of equal length
  if (!destination.datasets.length || destination.datasets.length == source.datasets.length) {
    for (let i = 0; i < source.datasets.length; i++) {
      // destination.datasets[i][property] = source.datasets[i][property]; // THIS DOES NOT WOEK
    }
  } else {
    console.log(destination.datasets.length);
    console.log(source.datasets.length);
    console.log("Source and destination datasets can not be synced");
  }
}
