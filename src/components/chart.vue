<script>

import pieChart from "./charts/pieChart"
import map from "./charts/map"

export default {
  props: ['data1', 'options', 'name'],
  data() {
    return {
      greeting: 'Hello World!'
    }
  },
  mounted() {
    this.renderChart()
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
          chart = pieChart(this.data1, this.options);
        } break;
        case "MAP": {
          chart = map([], {});
        }
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