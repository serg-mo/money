<template>

</template>
<script type="text/javascript">
    import { Bar } from 'vue-chartjs'

    export default {
      extends: Bar,
      props: ['chartdata', 'options', 'summary', 'label'],
      mounted () {
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

        // TODO: combine both options
        this.renderChart(this.chartdata, options)
      }
      /*
       let data = make_data_single(summary, label); // TODO: pass same color for every bar here
       // data.datasets.map((v) => { v.backgroundColor = colors[0]; }); // TODO: colors[0] 
       add_average(data.datasets);
       */
    }
</script>
