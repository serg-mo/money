<template>

</template>
<script type="text/javascript">
    import { Pie, mixins } from 'vue-chartjs'

    export default {
      extends: Pie,
      props: ['chartdata', 'options'],
      mounted () {
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

        //let data = null;
        //if (summary && label) {
        //  data = make_data_single(summary, label);
        //}

        // TODO: combine both options
        this.renderChart(this.chartdata, options)
      }
      /*
       // TODO: refactor all of this as plugins, https://www.chartjs.org/docs/latest/developers/plugins.html
       // TODO: add two sets of percentages to the pie legend, total and currently visible
       // TODO: clicking a slice should add a dataset to the stack
       pie_one.options.events = ["click", "hover"];
       pie_one.options.onClick = (event, items) => {
         if (items.length) {
           app.category_resolution = "subcategory";
           app.category            = items[0]._chart.data.labels[items[0]._index];
           app.subcategory         = null;
         } else {
           app.category_resolution = "category";
           app.category            = null;
           app.subcategory         = null;

           // this fires when I click on the labels in the legend
         }
       };

       let pie_one_existing_handler = pie_one.options.legend.onClick;
       pie_one.options.legend.onClick = (event, item) => {
         pie_one_existing_handler.call(pie_one, event, item)

         // TODO: check if this is safe to do first
         stack.data.datasets[item.index].hidden = !item.hidden; // it's about to be flipped
         stack.update();
       }


       // TODO: hovering, i.e., scrolling, through the stack should animate pie_two as a cross-section of the stack
       // hover fires too frequently when I'm over a slice, consider keeping the previous value
       // this will also help with time scroll keeping the same datasets visible

       // pie_two can do dataset toggle AND whitespace reset, I love it
       // this is because clicking nothing syncs hidden datasets and shows them all
       pie_two.options.events = ["click", "hover"];
       pie_two.options.onClick = (event, items) => {
         if (items.length) {
           //app.category_resolution = "subcategory";
           app.subcategory = items[0]._chart.data.labels[items[0]._index];
         } else {
           app.subcategory = null;

           stack.data.datasets[item.index].hidden = false;
           stack.update();
         }
       }


       let pie_two_existing_handler = pie_two.options.legend.onClick;
       pie_two.options.legend.onClick = (event, item) => {
         pie_two_existing_handler.call(pie_two, event, item);

         // TODO: check if this is safe to do first
         stack.data.datasets[item.index].hidden = !item.hidden;
         stack.update();
       }

       pie_two.options.tooltips.callbacks.footer = footer_callback_avg;
       */
    }
</script>
