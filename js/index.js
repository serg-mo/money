// jQuery for the win, http://youmightnotneedjquery.com
//TODO: consider hosting this on codepen.io or better yet, a cloudfront
//TODO: make the file input take up the full screen


var pie_one;
var pie_two;
var stack;
var bar;

var app;

// this does not work in jquery onload below
window.onload = () => {
  $(".ui.modal")
    .modal('setting', 'closable', false)
    .modal("show");
}

$(() => {
  $("#file").on("change", file_handler);

  app = new Vue({
    el: "#app",
    data: {
      CATEGORY_RESOLUTIONS: ["category", "subcategory", "merchant"],
      TIME_RESOLUTIONS:     ["date", "week", "month"],

      category_resolution:  "category",
      category:             null,
      subcategory:          null,
      time_resolution:      "month",

      time_after:           pick_cutoff("month"),
      time_before:          format_date(new Date),

      transactions:         [],
      query:                "",
      data:                 null,
      x:                    null,
      y:                    null,
      xy:                   null,
    },
    watch: {
      category_resolution: (val) => { update_query(); },
      category: (val)            => { update_query(); },
      subcategory: (val)         => { update_query(); },

      time_after: (val)          => { update_query(); },
      time_before: (val)         => { update_query(); },
      time_resolution: (val)     => {
        app.time_after  = pick_cutoff(val);
        app.time_before = format_date(new Date());

        update_query();
      },

      query: (val) => {
        app.data = jmespath.search(app.transactions, app.query);
        [app.x, app.y, app.xy] = three_summaries(app.data, app.category_resolution, app.time_resolution);
        //console.log([app.x, app.y, app.xy]);

        section_one_update(0);
      }
    }
  })

  $("body").on("keydown", key_handler);
});

function file_handler() {
  $(".ui.modal").modal("hide");

  let reader = new FileReader();
  reader.onload = reader_onload;
  reader.readAsText(event.target.files[0]);
}

function reader_onload(e) {
  let json = JSON.parse(e.target.result); // FileReader
  let transactions = json.transactions.map(parse_transaction);

  transactions = jmespath.search(transactions, "[?category != 'Income']"); // spending only
  transactions.sort((a, b) => { return (parse_date(a["date"]) - parse_date(b["date"])); }); // chronological order

  app.transactions = transactions;

  section_one_setup("#section_one");
  update_query();
  section_one_update(800); // initial call
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

function section_one_setup() {
  // TODO: refactor all of this as plugins, https://www.chartjs.org/docs/latest/developers/plugins.html
  // TODO: add two sets of percentages to the pie legend, total and currently visible

  let pie_one_canvas = document.createElement("canvas");
  let pie_two_canvas = document.createElement("canvas");
  let line_canvas    = document.createElement("canvas");
  let stack_canvas   = document.createElement("canvas");

  $("#pie_one").append(pie_one_canvas);
  $("#pie_two").append(pie_two_canvas);
  $("#line").append(line_canvas);
  $("#stack").append(stack_canvas);

  // globally visible vars
  pie_one = make_pie(pie_one_canvas);
  pie_two = make_pie(pie_two_canvas);
  line    = make_line(line_canvas);
  stack   = make_stack(stack_canvas);


  pie_one.config.options.events = ["click", "hover"];
  pie_one.config.options.onClick = function (event, items) {
    if (items.length) {
      app.category_resolution = "subcategory";
      app.category            = items[0]._chart.data.labels[items[0]._index];
      app.subcategory         = null;

      // TODO: clicking a slice should add a dataset to the stack
    } else {
      app.category_resolution = "category";
      app.category            = null;
      app.subcategory         = null;
    }
  };


  // pie_two can do dataset toggle AND whitespace reset, I love it
  // this is because clicking nothing syncs hidden datasets and shows them all
  
  pie_two.config.options.onClick = function (event, items) {
    if (items.length) {
      app.category_resolution = "subcategory";
      app.subcategory         = items[0]._chart.data.labels[items[0]._index];

      // TODO: clicking or hovering over the stack should *slowly* update the charti, i.e., animate the relative change
      // TODO: hovering, i.e., scrolling, through the stack will animate pie_two as a cross-section of the stack
      // TODO: synchronyze the two datasets in pie_two and stack

      stack.options.title.text = pie_two.config.options.title.text + (app.category ? `: ${app.category}` : "");

      // hide things other than the active one
      stack.data.datasets.forEach((v) => { v.hidden = (v.label != app.category) });
      stack.update();

      // TODO: sync_dataset_property(stack.config.data, pie_two.config.data, 'hidden');
    } else {
      console.log("pie_two click outside of legend");
      //setTimeout(() => sync_dataset_property(stack.config.data, pie_two.config.data, 'hidden')); // async sync
    }
  }
  pie_two.config.options.tooltips.callbacks.footer = footer_callback_avg;


  stack.config.options.onClick = function (event, items) {
    if (items.length) {
      pick_time_slice(items[0]._index);
    }
    // TODO: this does not work for some reason
    //setTimeout(() => sync_dataset_property(pie_two.config.data, stack.config.data, 'hidden')); // async sync
  }
  // TODO: onHover is more picky than tooltips.callbacks.title

  stack.config.options.tooltips.itemSort = function(a, b) { return b.yLabel - a.yLabel; };
  stack.config.options.tooltips.filter   = function(v) { return v.yLabel > 0; };
}

function update_query() {
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
    if (app.subcategory) {
      filter += ` && subcategory == '${app.subcategory}'`
    }
  }

  app.query = `[?${filter}].` + JSON.stringify(select);
  console.log(app.query);
}

function section_one_update(duration = 0) {
  if (app.data == null)
    return;

  // TODO: stack tells you where in time you are, which is a cross section of pie_two pipeline
  // TODO: on month click, redo the weekday summary
  // TODO: preserve labels if they are set

  // TODO: I can slice this function by chart
  let x_data  = make_data(app.x, "default");
  let y_data  = make_data(app.y, "default");
  let xy_data = make_data(app.xy, Object.keys(app.y)); // labels

  // TODO: consider making data as a set of points
  // add_average(xy_data.datasets); // this is useful for label

  if (app.category_resolution == "category") {
    pie_one.config.options.title.text = app.category || app.category_resolution;
    pie_one.config.data = x_data;

    pie_two.config.options.title.text = app.category || app.category_resolution;
    pie_two.config.data = x_data;

    stack.config.options.title.text = app.category || app.category_resolution;
    //sync_dataset_property(stack.config.data, xy_data, "data");
    stack.config.data = xy_data;

    line.config.options.title.text = app.category || app.category_resolution;
    line.config.data = y_data;
  } else {
    // do not update the left pie for anything else

    pie_two.config.options.title.text = app.category || app.category_resolution;
    pie_two.config.data = x_data;

    stack.config.options.title.text = app.category || app.category_resolution;
    sync_dataset_property(stack.config.data, xy_data, "data");
    stack.config.data = xy_data;
  }

  pie_one.update();
  pie_two.update();
  line.update();
  stack.update(duration);
}

function sync_dataset_property(destination, source)
{
  destination = source; // TODO: this is just a placeholder
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
  //if (pie_one.config.data.labels.includes(pie_two.config.data.datasets[0].label)) {
  //if (!stack.config.data.labels.includes(pie_two.config.data.datasets[0].label) || pie_two.config.data.datasets.length > 1) {
  if (true) {
    pie_two.config.data.labels = labels;

    // add to the top of the stack and chop it down
    pie_two.config.data.datasets.unshift({label, data, backgroundColor});
    pie_two.config.data.datasets = pie_two.config.data.datasets.slice(0, 2); // [start, stop index)

    pie_two.update({
      "duration": 8000
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

  // TODO  sync_dataset_property(pie_two.config.data, stack.config.data, 'hidden');
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
  // pie_one.onClick = () => { sync_dataset_property(stack.config.data, pie_one.config.data, 'hidden'); };

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
