// TODO: refactor all of this as plugins, https://www.chartjs.org/docs/latest/developers/plugins.html
// TODO: add two sets of percentages to the pie legend, total and currently visible

const CATEGORY_RESOLUTIONS = ["category", "subcategory", "merchant"];
const TIME_RESOLUTIONS = ["date", "week", "month"];


function section_one_wrapper() {
  app.query = get_query();
  app.data = jmespath.search(app.transactions, app.query); // this can't be a local variable
  [app.x, app.y, app.xy] = three_summaries(
    app.data,
    app.category_resolution,
    app.time_resolution,
  );
}

function section_one_update(duration = 0) {
  // TODO: same as below, except with subcategory filter, make this configurable
  // TODO: I can slice this function by chart
  // TODO: consider making data as a set of points
  let x_data = make_data(app.x, "default");
  let y_data = make_data(app.y, "default");
  let xy_data = make_data(app.xy, Object.keys(app.y)); // labels
  // add_average(xy_data.datasets); // this is useful for label
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

function get_query(include_subcategory = false) {
  // TODO: consider setting default columns here
  let fields = [app.category_resolution, app.time_resolution, "amount"]; // category first, amount last
  let select = fields.reduce((carry, value) => {
    carry[value] = value;
    return carry;
  }, {}); // array -> object

  let filter = `date >= '${app.time_after}'`;
  if (app.time_before) {
    filter += ` && date <= '${app.time_before}'`;
  }

  // prefer subcategory over category
  if (app.category_resolution == "subcategory" && app.category) {
    filter += ` && category == '${app.category}'`;

    // subcategory just keeps track of which datasets to show
    if (include_subcategory && app.subcategory) {
      filter += ` && subcategory == '${app.subcategory}'`;
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
  let x_summary = data.reduce(single_reducer(x), {});
  let y_summary = data.reduce(single_reducer(y), {});

  x_summary = sort_summary(x_summary);
  init = sort_summary(x_summary, 0); // preserve the order of the sorted summary (desc)

  let xy_summary = data.reduce(double_reducer(x, y), init);

  return [x_summary, y_summary, xy_summary];
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


  datetime = new Date(datetime.replace(" ", "T")); // important
  datetime = format_date(datetime);

  // TODO: refactor this into an array that becomes an object
  let comparisons;

  // TODO: this is essentially a custom stack, except not as a line but as datasets - categories
  // TODO: do a separate chart comparing this month/week/day to the same month/week/day last year/month/week

  // set the colors as shades, of black, where the older ones faint away
  // for example, I want to see the current week day by day compared to n previous weeks (total or selected category)

  // TODO: split based on time_resolution
  //"same_week_last_month"
  //"same_week_last_year"
  // "same_month_last_year": "[?month == '" + format_date(same_date_last_year).slice(0, -3) + "']",

  // TODO: bring back time_after update changing the stack width
}
