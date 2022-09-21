<script>

import pieChart from "./charts/pieChart"
import map from "./charts/map"
import BarChart from "./charts/barchart"
import Histogram from "./charts/histogram"
import legend from "./charts/legend.js"


export default {
  props: {
    chartData: {
      type: Object,
      required: true
    },
    options: {
      type: Object,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      greeting: 'Hello World!'
    }
  },
  watch: {
    chartData() {
      this.renderChart();
    },
    options() {
      this.renderChart();
    }
  },
  mounted() {
    this.renderChart();
  },
  methods: {
    renderChart() {
      let container = this.$refs.container;
      while (container.firstChild) {
        container.removeChild(container.lastChild);
      }
      let chart;
      switch (this.name) {
        case "PIE": {
          chart = pieChart(this.chartData, this.options);
        } break;
        case "MAP": {
          chart = map(this.chartData, {...this.options, vueChart: this});
        } break;
        case "BAR": {
          chart = BarChart(this.chartData, this.options);
        } break;
        case "HISTOGRAM": {
          chart = Histogram(this.chartData, this.options);
        } break;
        case "LEGEND": {
          chart = legend(this.chartData, this.options);
        } break;
      }
      container.append(chart);
    }
  }
}
</script>

<template>
  <div ref="container">

  </div>
</template>

<style>

</style>