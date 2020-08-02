function section_one_wrapper() {
  app.query = get_query();
  app.data = jmespath.search(app.transactions, app.query); // this can't be a local variable
  [app.x, app.y, app.xy] = three_summaries(app.data, app.category_resolution, app.time_resolution);

  [filter, select] = get_query(true).split('.');
  app.filtered = jmespath.search(app.transactions, filter);
}

function section_one_update(duration = 0) {
  if (!app.data.length)
    return;

  // TODO: same as below, except with subcategory filter, make this configurable

  // TODO: I can slice this function by chart
  let x_data  = make_data(app.x, "default");
  let y_data  = make_data(app.y, "default");
  let xy_data = make_data(app.xy, Object.keys(app.y)); // labels

  // TODO: consider making data as a set of points
  // add_average(xy_data.datasets); // this is useful for label
  //console.log(xy_data);

  if (app.category_resolution == "category") {
    pie_one.options.title.text = "";
    pie_one.data = x_data;

    //line.options.title.text = app.category || app.category_resolution;
    //line.data = y_data;
  }

  pie_two.options.title.text = app.category || app.category_resolution;
  pie_two.data = x_data;

  // TODO: just set the query here and have the chart figure out the rest
  //sync_dataset_property(stack.data, xy_data, "data"); // keep hidden datasets hidden
  stack.options.title.text = app.category + (app.subcategory ? `: ${app.subcategory}` : "");
  stack.data = xy_data;

  if (app.category_resolution == "subcategory" && app.category) {
    let base_color = colors[app.category] || colors['default'];
    let rgba       = base_color.match(/\d+/g);
    let palette    = get_palette(base_color, stack.data.datasets.length)

    pie_two.data.datasets[0].backgroundColor = palette;

    stack.data.datasets.forEach((dataset, index) => {
      dataset.backgroundColor = palette[index];
    });
  }

  app.charts.forEach((c) => { c.update() });
}

function get_palette(base_color, length) {
  let rgba    = base_color.match(/\d+/g);
  let palette = [];

  for (let i = 0; i < length; i++) {
    rgba[rgba.length - 1] = Math.round(100 * (length - i) / length) / 100; // alpha 1 .. 0
    palette.push(`rgba(${rgba.join(',')})`);
  }
  return palette;
}

function get_query(include_subcategory = false) {
  // TODO: consider setting default columns here
  let fields = [app.category_resolution, app.time_resolution, "amount"]; // category first, amount last
  let select = fields.reduce((carry, value) => { carry[value] = value; return carry; }, {}); // array -> object

  let filter = `date >= '${app.time_after}'`
  if (app.time_before) {
    filter += ` && date <= '${app.time_before}'`;
  }

  // prefer subcategory over category
  if (app.category_resolution == "subcategory" && app.category) {
    filter += ` && category == '${app.category}'`

    // subcategory just keeps track of which datasets to show
    if (include_subcategory && app.subcategory) {
      filter += ` && subcategory == '${app.subcategory}'`
    }
  }

  return `[?${filter}].` + JSON.stringify(select);
}


// TODO: instead of the hover note for average, add an extra dataset with avg as the only value
// TODO: pies should also do a total and average per slice

// TODO: given xy_summary, I can produce x_summary and y_summary (sorting belongs elsewhere)
// TODO: I am getting three columns, assume x and y are the first two and aggregate the third one
function three_summaries(data, x, y) {
  // I can do this in a single loop, but it's not necessary

  // first column values become datasets, graphed across the values from the second column
  let x_summary  = data.reduce(single_reducer(x), {});
  let y_summary  = data.reduce(single_reducer(y), {});

  x_summary = sort_summary(x_summary);
  init      = sort_summary(x_summary, 0); // preserve the order of the sorted summary (desc)

  let xy_summary = data.reduce(double_reducer(x, y), init);

  return [x_summary, y_summary, xy_summary];
}


function key_handler(event) {
  const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
  const key  = event.key;

  // TODO: up/down scale/shrink the interval, left/right move it (infer time resolution)
  if (keys.includes(key)) {
    event.preventDefault();

    if (key == "ArrowUp" || key == "ArrowDown") {
      let delta       = (key == "ArrowUp") ? 1 : -1;
      let current     = app.TIME_RESOLUTIONS.indexOf(app.time_resolution);
      let next        = Math.max(Math.min(current + delta, app.TIME_RESOLUTIONS.length - 1), 0);
      
      app.time_resolution = app.TIME_RESOLUTIONS[next];
    } else if (key == "ArrowLeft" || key == "ArrowRight") {
      let delta  = (key == "ArrowLeft") ? -1 : 1;
      let after  = parse_date(app.time_after);
      let before = parse_date(app.time_before);

      if (app.time_resolution == "month") {
        after.setMonth(after.getMonth() + delta, after.getDate()); // month [date]
        before.setMonth(before.getMonth() + delta + 1, 0); // last day of the month
      } else if (app.time_resolution == "week") {
        after.setDate(after.getDate() + (7 * delta));
        before.setDate(before.getDate() + (7 * delta));
      } else if (app.time_resolution == "date") {
        after.setDate(after.getDate() + delta);
        before.setDate(before.getDate() + delta);
      }

      app.time_after  = format_date(after);
      app.time_before = format_date(before);
    }

    /*
    document.querySelector("#time_resolution").selectedIndex = app.TIME_RESOLUTIONS.indexOf(time_resolution);
    document.querySelector("#time_after").value              = time_after;
    document.querySelector("#time_before").value             = time_before;
    */
  }
}

function pick_time_slice(index) {
  let label           = stack.data.labels[index]; // slice name
  let labels          = []; // stack datasets become pie labels
  let data            = []; 
  let backgroundColor = [];

  // clicking a stack, loads that slice into the comparison
  // for each dataset, extract the indexed slice
  stack.data.datasets.forEach((dataset) => {
    labels.push(dataset.label);
    backgroundColor.push(dataset.backgroundColor); // same colors on both graphs
    data.push(dataset.data[index]);
  });
  //console.log("Datasets", datasets);


  // reset datasets if the only existing dataset has a label that is a category
  //if (pie_one.data.labels.includes(pie_two.data.datasets[0].label)) {
  //if (!stack.data.labels.includes(pie_two.data.datasets[0].label) || pie_two.data.datasets.length > 1) {
  if (true) {
    pie_two.data.labels = labels;

    // add to the top of the stack and chop it down
    pie_two.data.datasets.unshift({label, data, backgroundColor});
    pie_two.data.datasets = pie_two.data.datasets.slice(0, 2); // [start, stop index)

    pie_two.update({
      "duration": 1000
    });
  }
}

function pick_cutoff(type) {
  //TODO: add shortcuts for YTD and 1yr
  let date = new Date();
  if (type == "month") {
    date.setMonth(date.getMonth() - 12); // same month last year
    date.setDate(1); // first of the month
  } else if (type == "week") {
    date.setDate(date.getDate() + ( - date.getDay() + 1) - (12 * 7)); // Monday, ~3 months ago
  } else {
    date.setMonth(date.getMonth() - 1); // same date last month
  }

  return format_date(date);
}

function format_date(date, format = "date") {
  let month = ("0" + (date.getMonth() + 1)).slice(-2); // zero-based month
  let day   = ("0" + date.getDate()).slice(-2); // zero-padded
  let year  = date.getFullYear();

  if (format == "date") {
    return [year, month, day].join("-");
  } else if (format == "week") {
    return [year, month, day].join("-"); // date of monday
  } else if (format == "month") {
    return [year, month].join("-"); // no date
  }
}

function parse_date(date) {
   let [year, month, day] = date.split("-");
   
   return new Date(year, parseInt(month) - 1, day); // zero-based month
}

function make_comparisons(datetime) {
  //let query = `[?${app.time_resolution} == '${label}'].{${app.time_resolution}: ${app.time_resolution}, category: category, subcategory: subcategory, amount: amount}`;
  //make_table($("#table"), filter_transactions(query));

  // TODO  sync_dataset_property(pie_two.data, stack.data, 'hidden');
  // TODO: highlight_row_in_legend(dataset_index);

  // TODO: I have the time_resolution and the date range, compare that date range to others like it
  // TODO: there is a bar chart for every time_resolution, set it onclick

  // TODO: do a separate chart comparing this month/week/day to the same month/week/day last year/month/week
  // unit   ...comparisons
  // day    same day last week, same date last month, same date last year
  // week   same week last month, same week last year
  // month  last month, same month last year

  /*
  let yesterday = new Date();
  yesterday.setDate(yesterday.getDate()- 1);

  let thisWeek = new Date();
  thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay()); // most recent Sunday
  thisWeek.setDate(thisWeek.getDate() + 6); // last week's Saturday

  let lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - lastWeek.getDay() - 7); // last week's Sunday
  lastWeek.setDate(lastWeek.getDate() + 6); // last week's Saturday

  let lastDayOfThisMonth = new Date();
  let nextMonth = lastDayOfThisMonth.getMonth() + 1; // next month
  lastDayOfThisMonth.setMonth(nextMonth);
  lastDayOfThisMonth.setDate(); // last day of the previous month (this month)
  lastDayOfThisMonth.setDate(1);

  let lastDayOfLastMonth = new Date(); // now
  lastDayOfLastMonth.setDate(); // last day of last month
  lastDayOfLastMonth.setDate(1); // set the end date first

  let thisYear = lastDayOfLastYear.getFullYear();
  lastDayOfLastYear.setFullYear(thisYear - 1, 11, 31); // last year, december 31st (0 based month)
  lastDayOfLastYear.setMonth(); // January
  lastDayOfLastYear.setDate(1); // 1st

  let lastDayOfLastYear = new Date();
  let thisYear = lastDayOfLastYear.getFullYear();
  lastDayOfLastYear.setFullYear(thisYear - 1, 11, 31); // last year, december 31st (0 based month)
  lastDayOfLastYear.setMonth(); // January
  lastDayOfLastYear.setDate(1); // 1st
  */

  datetime = new Date(datetime.replace(" ", "T")); // important
  datetime = format_date(datetime);

  // TODO: refactor this into an array that becomes an object
  let comparisons;



  // TODO: this is essentially a custom stack, except not as a line but as datasets - categories
  // TODO: do a separate chart comparing this month/week/day to the same month/week/day last year/month/week

  if (app.time_resolution == "day") {
    let same_day_last_week  = new Date(datetime);
    same_day_last_week.setDate(same_day_last_week.getDate() - 7);
    same_day_last_week = format_date(same_day_last_week);

    let same_date_last_month = new Date(datetime);
    same_date_last_month.setMonth(same_date_last_month.getMonth() - 1);
    same_date_last_month = format_date(same_date_last_month);

    let same_day_last_year  = new Date(datetime);
    same_day_last_year.setDate(same_day_last_year.getDate() - 7 * 52); // a year worth of weeks (?)
    same_day_last_year = format_date(same_day_last_year);

    let same_date_last_year = new Date(datetime);
    same_date_last_year.setYear(same_date_last_year.getFullYear() - 1);
    same_date_last_year = format_date(same_date_last_year);


    comparisons = {
      datetime:             "[?date == '" + datetime + "']",
      same_day_last_week:   "[?date == '" + same_day_last_week + "']",
      same_date_last_month: "[?date == '" + same_date_last_month + "']",
      same_day_last_year:   "[?date == '" + same_day_last_year + "']",
      same_date_last_year:  "[?date == '" + same_date_last_year + "']",
    };
  } else if (app.time_resolution == "month") {
    let same_month_last_year = new Date(datetime);
    same_month_last_year.setYear(same_month_last_year.getFullYear() - 1);

    let last_month = new Date(datetime);
    last_month.setMonth(last_month.getMonth() - 1);

    comparisons = {
      datetime:             "[?month == '" + datetime + "']",
      same_month_last_year: "[?month == '" + same_month_last_year + "']",
      same_month_last_year: "[?month == '" + last_month + "']",
    };
  }

  // set the colors as shades, of black, where the older ones faint away
  // for example, I want to see the current week day by day compared to n previous weeks (total or selected category)


  // TODO: split based on time_resolution
  //"same_week_last_month"
  //"same_week_last_year"
  // "same_month_last_year": "[?month == '" + format_date(same_date_last_year).slice(0, -3) + "']",


  // TODO: bring back time_after update changing the stack width
  // pie_one.onClick = () => { sync_dataset_property(stack.data, pie_one.data, 'hidden'); };

  // bar.options.title.text = category;
  // bar.data = make_data(y_summary, category);
  // bar.data.datasets.map((v) => { v.backgroundColor = colors[0]; }); // TODO: this is redundant
  // add_average(bar.data.datasets);
  // bar.update();

  console.table(comparisons);
  let canvas = $("#bar_one canvas");

  // TODO: this should be a map
  let datasets = [];
  for (var i in comparisons) {
    let query = `${comparisons[i]}.{category: category, amount: amount}`;
    comparisons[i] = filter_transactions(query).reduce(single_reducer("category"), {});
  }
  console.log(comparisons);

  // TODO: have chart labels synched by asigning one to another
  return make_bar(canvas, comparisons, pie_two.data.labels); // clever
}
