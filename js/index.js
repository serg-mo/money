// http://paletton.com
const colors = [
  "#C6DCA3", "#AA7339", "#D4BD6A", "#837EB1",
  "#457585", "#26596A", "#DB684E", "#393276",
  "#806815", "#6C939F", "#313841", "#104050", "#5B5494", '#0D083B', '#AA9139', "#022835", 
];

/*
const colors = [
  "#A7CECB", "#8BA6A9", "#75704E", "#CACC90", "#F4EBBE",
  "#1B2021", "#51513D", "#A6A867", "#E3DC95", "#E3DCC2",
];
*/

var transactions;
var pie_one;
var pie_two;
var stack;
var bar;

const CATEGORY_RESOLUTIONS = ["category", "subcategory", "merchant"];
const TIME_RESOLUTIONS     = ["date", "week", "month"];

var category_resolution    = "category";
var time_resolution        = "month";

var time_after             = pick_cutoff(time_resolution);
var time_before            = format_date(new Date);

window.onload = function() {
  document.querySelector("#file").addEventListener("change", file_handler);
  document.addEventListener('keydown', key_handler); // TODO: is this the best place for it?

  document.querySelector("#time_resolution").selectedIndex = TIME_RESOLUTIONS.indexOf(time_resolution);
  document.querySelector("#time_after").value              = time_after;
  document.querySelector("#time_before").value             = time_before;
}

function file_handler() {
  event.target.parentNode.style.display = "none";

  let reader = new FileReader();
  reader.onload = function (e) {
    let json = JSON.parse(e.target.result); // FileReader
    transactions = json.transactions.map(parse_transaction);
    transactions = jmespath.search(transactions, "[?category != 'Income']"); // spending only

    transactions.sort((a, b) => { return (parse_date(a["date"]) - parse_date(b["date"])); });
    // chronological order, console.table(transactions, ["date"]);


    document.querySelector("#section_one").style.display = "flex";

    section_one_setup("#section_one");
    set_events(section_one_update);
    section_one_update();
  }
  reader.readAsText(event.target.files[0]);
}

function parse_transaction(t)
{
  // uuid, record_type, transaction_type, bookkeeping_type
  // description, categories.[].[name, folder]
  // times.[when_recorded,when_received] // timestamp
  // amounts.[].amount // cents * 100
  // geo.[city, state, zip, lat, lon, timezone]
  // subtype, // t["transaction_type"]
  // datetime, // datetime->format("Y-m-d H:i:s")
  // month, // datetime->format("M")
  // time, // datetime->format("H:i:s")
  // weekday, // datetime->format("D")

  // source: "UTC", destination: "America/Los_Angeles"
  let str      = t["times"]["when_recorded_local"].slice(0, 19).replace(" ", "T"); // yyyy-mm-ddThh:mm:ss
  let datetime = new Date(str); 

  let monday   = new Date(datetime);
  monday.setDate(datetime.getDate() - datetime.getDay() + 1);

  let result = {
    amount:       t["amounts"]["amount"] / 10000,
    type:         t["bookkeeping_type"],
    category:     t["categories"][0]["folder"],
    subcategory:  t["categories"][0]["name"],
    description:  t["description"], // raw description
    date:         format_date(datetime, "date"),
    week:         format_date(monday, "week"),
    month:        format_date(datetime, "month"),
  };

  return result;
}

function set_events(update) {
  $("#time_resolution").change(function() {
    time_resolution = $(this).val();
    time_after      = pick_cutoff(time_resolution);
    time_before     = "";

    $("#time_after").val(time_after);

    update();
  });

  $("#time_after").change(function() {
    time_after = $(this).val();

    update();
  });

  $("#time_before").change(function() {
    time_before = $(this).val();

    update();
  });
}

function section_one_setup(selector) {
  // TODO: refactor all of this as plugins, https://www.chartjs.org/docs/latest/developers/plugins.html

  let pie_one_canvas   = document.createElement("canvas");
  let pie_two_canvas   = document.createElement("canvas");
  let pie_three_canvas = document.createElement("canvas");

  document.querySelector(selector + " #pie_one").appendChild(pie_one_canvas);
  document.querySelector(selector + " #pie_two").appendChild(pie_two_canvas);
  document.querySelector(selector + " #stack").appendChild(pie_three_canvas);

  // globally visible vars
  pie_one = make_pie(pie_one_canvas);
  pie_two = make_pie(pie_two_canvas);
  stack   = make_stack(pie_three_canvas);


  pie_one.config.options.events = ["click", "hover"];
  pie_one.config.options.onClick = function (event, items) {
    if (items.length) {
      pick_category(items[0]._chart.data.labels[items[0]._index]);
    } else {
      setTimeout(() => sync_hidden_datasets(stack, pie_one)); // async sync
    }
  };


  pie_two.config.options.onClick = function (event, items) {
    if (items.length) {
      pick_subcategory(items[0]._chart.data.labels[items[0]._index]);
    } else {
      setTimeout(() => sync_hidden_datasets(stack, pie_two)); // async sync
    }
  }
  pie_two.config.options.tooltips.callbacks.footer = footer_callback_avg;


  stack.config.options.onClick = function (event, items) {
    if (items.length) {
      pick_time_slice(items[0]._index);
    }
    // TODO: this does not work for some reason
    setTimeout(() => sync_hidden_datasets(pie_two, stack)); // async sync
  }
  // TODO: onHover is more picky than tooltips.callbacks.title

  stack.config.options.tooltips.itemSort = function(a, b) { return b.yLabel - a.yLabel; };
  stack.config.options.tooltips.filter = function(v) { return v.yLabel > 0; };

  // TODO: jquery is better than native code
  $("#time_resolution").val();
  $("#time_after").val(time_after);
}

function section_one_update(query = "[]") {
  let current  = `${query}.{${category_resolution}: ${category_resolution}, ${time_resolution}: ${time_resolution}, amount: amount}`;
  let data     = filter_transactions(current);
  let [x_summary, y_summary, xy_summary, subset] = three_summaries(data, category_resolution, time_resolution);
  //console.log(x_summary);


  // TODO: stack tells you where in time you are, which is a cross section of pie_two pipeline
  // TODO: on month click, redo the weekday summary
  // TODO: preserve labels if they are set

  if (query == "[]") {
    let original = `${query}.{category: category, ${time_resolution}: ${time_resolution}, amount: amount}`;
    let summary  = filter_transactions(original).reduce(single_reducer("category"), {});

    summary = sort_summary(summary);

    pie_one.config.data = make_data(summary, original);
    pie_two.config.data = make_data(summary, original);
  }


  pie_two.config.data = make_data(x_summary, query);
  stack.config.data   = make_data(xy_summary, Object.keys(y_summary));

  pie_one.update();
  pie_two.update();
  stack.update();
}

function key_handler(event) {
  const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
  const key  = event.key;

  if (keys.includes(key)) {
    event.preventDefault();
    //console.log(key);

    // 
    if (key == "ArrowUp" || key == "ArrowDown") {
      let delta       = (key == "ArrowUp") ? 1 : -1;
      let current     = TIME_RESOLUTIONS.indexOf(time_resolution);
      let next        = Math.max(Math.min(current + delta, TIME_RESOLUTIONS.length - 1), 0);
      
      time_resolution = TIME_RESOLUTIONS[next];
      time_after      = pick_cutoff(time_resolution);
      time_before     = format_date(new Date());
    } else if (key == "ArrowLeft" || key == "ArrowRight") {
      let delta  = (key == "ArrowLeft") ? -1 : 1;
      let after  = parse_date(time_after);
      let before = parse_date(time_before);

      if (time_resolution == "month") {
        after.setMonth(after.getMonth() + delta, after.getDate()); // month [date]
        before.setMonth(before.getMonth() + delta + 1, 0); // last day of the month
      } else if (time_resolution == "week") {
        after.setDate(after.getDate() + (7 * delta));
        before.setDate(before.getDate() + (7 * delta));
      } else if (time_resolution == "date") {
        after.setDate(after.getDate() + delta);
        before.setDate(before.getDate() + delta);
      }

      time_after  = format_date(after);
      time_before = format_date(before);
    }

    document.querySelector("#time_resolution").selectedIndex = TIME_RESOLUTIONS.indexOf(time_resolution);
    document.querySelector("#time_after").value              = time_after;
    document.querySelector("#time_before").value             = time_before;

    section_one_update();
  }
}

function pick_category(category = "") {
  let query;

  if (category) {
    category_resolution = "subcategory";
    query              = `[?category == '${category}']`
  } else {
    category_resolution = "category";
    query              = "[]";
  }

  pie_two.config.options.title.text = category;
  stack.config.options.title.text   = category;

  section_one_update(query)
}

function pick_subcategory(subcategory = "") {
  // TODO: clicking or hovering over the stack should *slowly* update the charti, i.e., animate the relative change
  // TODO: hovering, i.e., scrolling, through the stack will animate pie_two as a cross-section of the stack
  // TODO: synchronyze the two datasets in pie_two and stack

  let category_resolution;
  let query;

  if (subcategory) {
    category_resolution = "subcategory";
    query              = `[?subcategory == '${subcategory}']`
  } else {
    category_resolution = "category";
    query              = "[]";
  }
  query += `.{${time_resolution}: ${time_resolution}, amount: amount}`;

  stack.options.title.text = pie_two.config.options.title.text + (subcategory ? `: ${subcategory}` : "");

  // hide things other than the active subcategory
  stack.data.datasets.forEach(function(v){
    v.hidden = (v.label != subcategory)
  });
  stack.update();
  // TODO: sync_hidden_datasets(stack, pie_two);
}

function pick_time_slice(index) {
  let label           = stack.data.labels[index]; // slice name
  let labels          = []; // stack datasets become pie labels
  let data            = []; 
  let backgroundColor = [];

  // clicking a stack, loads that slice into the comparison
  // for each dataset, extract the indexed slice
  stack.data.datasets.forEach(function(dataset) {
    labels.push(dataset.label);
    backgroundColor.push(dataset.backgroundColor); // same colors on both graphs
    data.push(dataset.data[index]);
  });
  //console.log("Datasets", datasets);


  // reset datasets if the only existing dataset has a label that is a category
  //if (pie_one.config.data.labels.includes(pie_two.config.data.datasets[0].label)) {
  //if (!stack.config.data.labels.includes(pie_two.config.data.datasets[0].label) || pie_two.config.data.datasets.length > 1) {
  if (true) {
    pie_two.config.data.labels = labels;

    //pie_two.config.data.datasets.push();
    pie_two.config.data.datasets = [{label, data, backgroundColor}];

    pie_two.update();
  }
}

function pick_cutoff(type) {
  let date = new Date();
  if (type == "month") {
    date.setMonth(date.getMonth() - 12); // same month last year
    date.setDate(1); // first of the month
  } else if (type == "week") {
    date.setDate(date.getDate() + ( - date.getDay() + 1) - (12 * 7)); // Monday, ~3 months ago
  } else {
    date.setMonth(date.getMonth() - 1); // same date last month
  }
  //console.log(format_date(date));

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

function filter_transactions(query = "", field = "date") {
  let data;
  let filter = `${field} >= '${time_after}'`;
  if (time_before) {
    filter+= ` && ${field} <= '${time_before}'`;
  }

  // TODO: consider setting default columns here
  query = query ? `[?${filter}] | ${query}` : `${filter}`; // query sets the columns, not filter
  data  = jmespath.search(transactions, query);

  //console.log(query);
  //console.table(data);

  return data;
}

function make_comparisons(datetime) {
  //let query = `[?${time_resolution} == '${label}'].{${time_resolution}: ${time_resolution}, category: category, subcategory: subcategory, amount: amount}`;
  //make_table($("#table"), filter_transactions(query));

  // TODO  sync_hidden_datasets(pie_two, stack);
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

  if (time_resolution == "day") {
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
  } else if (time_resolution == "month") {
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
  // pie_one.onClick = () => { sync_hidden_datasets(stack, pie_one); };

  // bar.config.options.title.text = category;
  // bar.config.data = make_data(y_summary, category);
  // bar.config.data.datasets.map((v) => { v.backgroundColor = colors[0]; }); // TODO: this is redundant
  // add_average(bar.config.data.datasets);
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
