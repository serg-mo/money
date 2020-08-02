<script type="text/javascript">
  export default {
    transactions: [],

    //TODO: make the file input take up the full screen
    file_handler() {
      let reader = new FileReader();
      reader.onload = reader_onload;
      reader.readAsText(event.target.files[0]);
    }

    reader_onload(e) {
      let json = JSON.parse(e.target.result); // FileReader
      set_transactions(json.transactions)
    }

    set_transactions(transactions)
    {
      this.transactions = transactions.map(parse_transaction);
      this.transactions = jmespath.search(this.transactions, "[?category != 'Income']"); // spending only
      this.transactions.sort((a, b) => { return (parse_date(a["date"]) - parse_date(b["date"])); }); // chronological order
    }

    parse_transaction(t)
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
      let str      = t["times"]["when_recorded_local"].slice(0, 10).replace(" ", "T"); // yyyy-mm-dd
      let datetime = new Date(t["times"]["when_recorded_local"]);

      let monday   = new Date(datetime);
      monday.setDate(datetime.getDate() - datetime.getDay() + 1);

      return {
        date:         format_date(datetime, "date"),
        week:         format_date(monday, "week"),
        month:        format_date(datetime, "month"),
        amount:       t["amounts"]["amount"] / 10000,
        category:     t["categories"][0]["folder"],
        subcategory:  t["categories"][0]["name"],
        description:  t["description"], // raw description
      };
    }
  }
</script>
