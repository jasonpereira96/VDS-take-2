<script>
import Chart from "./components/chart.vue"

export default {
  data() {
    return {
      options: {
        name: d => d.category,
        value: d => d.value,
        colors: ["cornflowerblue", "pink"]
      }
    }
  },
  computed: {
    data() {
      return [{
        category: "Male",
        value: 50
      }, {
        category: "Female",
        value: 50
      }];
    }
  }
}

</script>

<template>
  <head>
    <title>My homepage</title>
    <meta charset="UTF-8">
    <meta http-equiv="cache-control" content="no-cache" />
    <meta http-equiv="pragma" content="no-cache" />
    <meta http-equiv="content-type" content="text/html; charset=UTF-8">
    <meta name="viewport"
      content="width=device-width,user-scalable=0,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0">
  </head>

  <body>
    <div id="app">
      <div class="navbar">
        <div class="button">Gun deaths by gender</div>
        <div class="button"></div>
        <div class="button"></div>
      </div>

      <div id="main">
        <div class="col">
          <div id="viz">
            <Chart name="MAP" :data1="{}" :options="{}"></Chart>
          </div>
          <div id="legend"></div>
        </div>
        <div class="col">
          <h2> Illinois </h2>
          <div id="viz2">
            <Chart name="PIE" :data1="data" :options="options"></Chart>
          </div>
        </div>
      </div>
    </div>
  </body>
</template>

<style scoped>
body {
}

#main {
    display: flex;
}
.col {
    flex: 1;
}
</style>
