<script>
import Chart from "./components/chart.vue"
import records from "./data/gun-deaths.json";
import _ from "lodash";
import { getStateCode, getFreqByState } from "./utils/process";

import { scaleSequential, interpolatePiYG, interpolatePuRd, range, interpolate } from "d3";

const filterOptions = {
  ALL: 1,
  GENDER: 2,
  AGE0_20: 3,
  AGE20_40: 4, 
  AGE40_60: 5, 
  AGE60_80: 6, 
  AGE80: 7
}

console.log(records.filter(r => !r.hasNull).filter(r => 20 <= r.age && r.age < 30))



// import { BButton } from 'bootstrap-vue'

// Vue.component('b-button', BButton)

export default {
  data() {
    return {
      options: {
        name: d => d.category,
        value: d => d.value,
        colors: ["cornflowerblue", "pink"],
      },
      activeState: null,
      records,
      isBlackHat: false,
      showBubbles: true,
      filterSelected: filterOptions.ALL,
      filterOptions: [
        {value: filterOptions.ALL, text: "None"},
        {value: filterOptions.GENDER, text: "Gender"},
        {value: filterOptions.AGE0_20, text: "Age Group: 0 - 20"},
        {value: filterOptions.AGE20_40, text: "Age Group: 20 - 40"},
        {value: filterOptions.AGE40_60, text: "Age Group: 40 - 60"},
        {value: filterOptions.AGE60_80, text: "Age Group: 60 - 80"},
        {value: filterOptions.AGE80, text: "Age Group: 80+"}
      ]
    }
  },
  computed: {
    filteredRecords() {
      return records.filter(r => !r.hasNull);
    },
    barChartData() {
      let t = this.filteredRecords;
      if (this.activeState !== null) {
        t = t.filter(r => r.state === getStateCode(this.activeState));
      }
      return t;
    },
    barChartOptions() {
      return {
        value: d => d.age,
        label: "Age",
        yLabel: "Deaths",
        height: 300,
        color: "steelblue",
        thresholds: Math.max(10)
      };
    },
    pieChartData() {
      let t = this.filteredRecords;
      if (this.activeState !== null) {
        t = t.filter(r => r.state === getStateCode(this.activeState));
      }
      t = _.countBy(t, r => r.gender);
      return [{
        category: "Male",
        value: t.M
      }, {
        category: "Female",
        value: t.F
      }];
    },
    mapData() {
      let t = records.filter(r => !r.hasNull);
      switch (this.filterSelected) {
        case filterOptions.AGE0_20: {
          return t.filter(r => 0 <= r.age && r.age <= 20);
        } break;
        case filterOptions.AGE20_40: {
          return t.filter(r => 20 <= r.age && r.age <= 40);
        } break;
        case filterOptions.AGE40_60: {
          return t.filter(r => 40 <= r.age && r.age <= 60);
        } break;
        case filterOptions.AGE60_60: {
          return t.filter(r => 60 <= r.age && r.age <= 80);
        } break;
        case filterOptions.AGE80: {
          return t.filter(r => 80 <= r.age);
        } break;
        default: {
          return t;
        }
      }
    },
    mapOptions() {
      const options = {};
      options.showBubbles = this.showBubbles;
      options.useSqrtScale = !this.isBlackHat;
      options.cScale = this.cScale
      options.isGenderFilterActive = this.isGenderFilterActive;
      return options;
    },
    legendData() {
      let min, max;
      const isGenderFilterActive = this.isGenderFilterActive;
      if (isGenderFilterActive) {
        min = 0; max = 100;
      } else {
        const stateFreq = getFreqByState(this.mapData);
        min = Math.min(...Object.values(stateFreq));
        max = Math.max(...Object.values(stateFreq));
      }
      return {
        color: this.cScale,
        title: isGenderFilterActive ? "Percentage of Male deaths" : "Gun deaths by state"
      }
    },
    isGenderFilterActive() {
      return this.filterSelected === filterOptions.GENDER;
    },
    cScale() {
      const stateFreq = getFreqByState(this.mapData);
      let min = Math.min(...Object.values(stateFreq));
      let max = Math.max(...Object.values(stateFreq));
      const isGenderFilterActive = this.isGenderFilterActive;
      if (isGenderFilterActive) {
        return scaleSequential()
          .domain([0, 100])
          .interpolator(this.interpolator);
      } else {
        return scaleSequential()
          .domain([min, max])
          .interpolator(this.interpolator);
      }
    },
    interpolator() {
      return this.filterSelected === filterOptions.GENDER ? interpolate("rgb(108,99,255)", "red") : interpolate("white", "grey");
    }
  },
  methods: {
    onStateClick(stateName) {
      console.log(stateName);
      this.activeState = stateName;
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
      <div class="1navbar">
        White Hat
        <b-form-checkbox v-model="isBlackHat" switch>
        Black Hat
        </b-form-checkbox>
      </div>

      <div id="main">
        <div class="col">
          <div id="viz">
            <Chart name="MAP" :chartData="mapData" :options="mapOptions" @state-clicked="onStateClick"></Chart>
          </div>
          <div id="legend">
            <Chart name="LEGEND" :chartData="legendData" :options="{}"></Chart>
          </div>
        </div>
        <div class="col">
          <b-form-select v-model="filterSelected" :options="filterOptions" size="sm"></b-form-select>
            <b-form-checkbox v-model="showBubbles" switch>
              Show Deaths by City
            </b-form-checkbox>
          <h2> {{ activeState === null ? "USA" : activeState + " (Total Deaths)"}} </h2>
          <div id="viz2">
            <Chart name="PIE" :chartData="pieChartData" :options="options"></Chart>
          </div>
          <div id="viz3">
            <Chart name="HISTOGRAM" :chartData="barChartData" :options="barChartOptions"></Chart>
          </div>
          <div id="controls">
            <!-- <b-button>Show Gender Map</b-button> -->
           
          </div>
        </div>
      </div>
    </div>
  </body>
</template>

<style scoped>
body {
  padding: 10px;
}

#main {
    display: flex;
}
.col {
    flex: 1;
}
</style>
<style>
.city-circle {
  pointer-events: none;
}
</style>
