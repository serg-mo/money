<template>

</template>
<script type="text/javascript">
    import { Line, mixins } from 'vue-chartjs'

    export default {
      extends: Line,
      props: ['chartdata', 'options'],
      mounted () {
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

        //let data = make_data_multiple(summary, labels); // TODO: pass primary color
        // TODO: consider adding average datasets here

        // TODO: combine both options
        this.renderChart(this.chartdata, options)
      }
      /*
       // TODO: clicking or hovering over the stack should *slowly* update the charti, i.e., animate the relative change
       stack.options.events = ["click", "hover"];
       stack.options.onClick = (event, items) => {
         if (items.length) {
           pick_time_slice(items[0]._index);
         }
         // TODO: this does not work for some reason
         //setTimeout(() => sync_dataset_property(pie_two.data, stack.data, 'hidden')); // async sync
       }

       let stack_existing_handler = stack.options.legend.onClick;
       stack.options.legend.onClick = (event, item) => {
         if (typeof item == 'object') {
           let {datasetIndex, hidden} = item; // text is the label

           if (app.category) {
             meta = pie_two.getDatasetMeta(0);
             meta.data[datasetIndex].hidden = !hidden; // it's about to be flipped
             pie_two.update();
           } else {
             meta = pie_one.getDatasetMeta(0);
             meta.data[datasetIndex].hidden = !hidden; // it's about to be flipped
             pie_one.update();
           }
         } else {
           console.log("Items are empty on stack lengend click")
         }

         stack_existing_handler.call(stack, event, item)
       }

       // TODO: onHover is more picky than tooltips.callbacks.title

       stack.options.tooltips.itemSort = (a, b) => { return b.yLabel - a.yLabel; };
       stack.options.tooltips.filter   = (v) => { return v.yLabel > 0; };
       */
    }
</script>
