<script type="text/javascript">
  import { Line, mixins } from 'vue-chartjs'

  export default {
    extends: Line,
    props: ['options'],
    mixins: [mixins.reactiveProp],
    mounted () {
      // stacked axes can not be changed later
      /*
      let options = {
        scales: {
          yAxes: [{
            stacked: false,
            ticks: {
              //callback: ticks_callback
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
      */

      //return draw(destination, "line", make_data_single(summary, label), options);

      // TODO: combine both options
      this.renderChart(this.chartdata, this.options)
    }
  }
</script>
