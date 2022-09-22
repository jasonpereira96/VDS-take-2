<script>
import Chart from "./components/chart.vue"
import records from "./data/gun-deaths.json";
import _ from "lodash";
import { getStateCode, getFreqByState } from "./utils/process";

import { scaleSequential, scaleSequentialLog, scaleLog, interpolatePiYG, interpolatePuRd, range, interpolate, interpolatePRGn, interpolateYlOrRd } from "d3";

const filterOptions = {
  ALL: 1,
  GENDER: 2,
  AGE0_20: 3,
  AGE20_40: 4, 
  AGE40_60: 5, 
  AGE60_80: 6, 
  AGE80: 7,
  MALE: 8,
  FEMALE: 9,
  CITY: 10
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
      normalize: false,
      creditsModalOpen: false,
      activeState: null,
      records,
      isBlackHat: false,
      showBubbles: true,
      filterSelected: filterOptions.CITY,
      filterOptions: [
        {value: filterOptions.CITY, text: "All deaths by City and State"},
        {value: filterOptions.ALL, text: "All deaths by State"},
        // {value: filterOptions.GENDER, text: "Gender", disabled: this.isBlackHat },
        {value: filterOptions.MALE, text: "Male Deaths by state"},
        {value: filterOptions.FEMALE, text: "Female Deaths by state"},
        {value: filterOptions.AGE0_20, text: "Age Group: 0 - 20"},
        {value: filterOptions.AGE20_40, text: "Age Group: 20 - 40"},
        {value: filterOptions.AGE40_60, text: "Age Group: 40 - 60"},
        {value: filterOptions.AGE60_80, text: "Age Group: 60 - 80"},
        {value: filterOptions.AGE80, text: "Age Group: 80+"}
      ]
    }
  },
  watch: {
    showBubbles() {
      if (this.showBubbles)
        this.filterSelected = filterOptions.ALL;
    },
    isBlackHat() {
      if (this.isBlackHat) {
        this.normalize = false;
      }
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
        case filterOptions.MALE: {
          return t.filter(r => r.gender === "M");
        } break;
        case filterOptions.FEMALE: {
          return t.filter(r => r.gender === "F");
        } break
        default: {
          return t;
        }
      }
    },
    mapOptions() {
      const options = {};
      options.showBubbles = this.filterSelected === filterOptions.CITY;
      options.useSqrtScale = !this.isBlackHat;
      options.cScale = this.cScale
      options.isGenderFilterActive = this.isGenderFilterActive;
      options.normalize = this.normalize;
      return options;
    },
    legendData() {
      let min, max;
      const isGenderFilterActive = this.isGenderFilterActive;
      if (isGenderFilterActive) {
        min = 0; max = 100;
      } else {
        const stateFreq = getFreqByState(this.mapData, this.normalize);
        min = Math.min(...Object.values(stateFreq));
        max = Math.max(...Object.values(stateFreq));
      }
      return {
        color: this.cScale,
        title: "Gun deaths by state " + (this.normalize ? "(per 1000 people)" : "" )
      }
    },
    isGenderFilterActive() {
      return this.filterSelected === filterOptions.GENDER;
    },
    cScale() {
      const stateFreq = getFreqByState(this.mapData, this.normalize);
      let min = Math.min(...Object.values(stateFreq));
      let max = Math.max(...Object.values(stateFreq));
      const isGenderFilterActive = this.isGenderFilterActive;
      const scale = this.isBlackHat ?  scaleSequentialLog : scaleSequential;
      let s = scale().domain(isGenderFilterActive ? [0, 100] : [min, max]);

      // return s.range(this.colorRange);
      if (s.interpolate) {
        // return s.range(this.colorRange);
        return s.interpolate(this.interpolator);
      } else {
        return s.interpolator(this.interpolator);
      }
      
    },
    colorRange() {
      const c = "#DC143C";
      const filterColors = {
        [filterOptions.ALL]: ["white", c],
        [filterOptions.CITY]: ["white", "grey"],
        [filterOptions.GENDER]: ["purple", "green"],
        [filterOptions.AGE0_20]: ["white", c],
        [filterOptions.AGE20_40]: ["white", c], 
        [filterOptions.AGE40_60]: ["white", c], 
        [filterOptions.AGE60_80]: ["white", c], 
        [filterOptions.AGE80]: ["white", c],
        [filterOptions.MALE]: ["white", "#0066CC"],
        [filterOptions.FEMALE]: ["white", "#F9629F"]
      };
      return filterColors[this.filterSelected];
    },
    interpolator() {
      const c = "#DC143C";
      const filterColors = {
        [filterOptions.ALL]: interpolateYlOrRd,
        [filterOptions.CITY]: interpolate("white", "grey"),
        [filterOptions.GENDER]: interpolatePRGn,
        [filterOptions.AGE0_20]: interpolatePuRd,
        [filterOptions.AGE20_40]: interpolatePuRd, 
        [filterOptions.AGE40_60]: interpolatePuRd, 
        [filterOptions.AGE60_80]: interpolatePuRd, 
        [filterOptions.AGE80]: interpolatePuRd,
        [filterOptions.MALE]: interpolate("white", "blue"),
        [filterOptions.FEMALE]: interpolate("white", "#F9629F")
      };
      return filterColors[this.filterSelected];
    }
  },
  methods: {
    onStateClick(stateName) {
      console.log(stateName);
      this.activeState = stateName;
    },
    onCreditsClick() {
      this.creditsModalOpen = !this.creditsModalOpen;
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
      <div class="main-navbar">
        <div class="title"> Change radius scale and log scale and normalize data add male female maps </div>
        <div class="switch-wrapper">
          <span class="wh">White Hat</span>
          <b-form-checkbox v-model="isBlackHat" switch></b-form-checkbox>
          <span>Black Hat</span>
        </div>
        <div class="credits-button-wrapper">
          <b-button @click="onCreditsClick">Credits and Write-ups</b-button>
        </div>        
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
          <b-form-checkbox v-if= "!isBlackHat" v-model="normalize" switch>Normalize by state population</b-form-checkbox>
          <b-form-select v-model="filterSelected" :options="filterOptions" size="sm"></b-form-select>
          <h2> {{ activeState === null ? "USA (Click on a state for more info)" : activeState + " (Total Deaths)"}} </h2>
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
    <b-modal id="modal-1" title="Credits and Write-ups" v-model="creditsModalOpen" hide-footer>
      <h3>Credits</h3>
      <ul>
        <li>D3 Gallery</li>
        <li>D3 Gallery</li>
        <li>D3 Gallery</li>
        <li>D3 Gallery</li>
      </ul>
      <h3>Black Hat</h3>
      <p class="my-4">Hello from modal!</p>
      <h3>White Hat</h3>
      <p class="my-4">Hello from modal!</p>
    </b-modal>
  </body>
</template>

<style scoped>
body {
}
.main-navbar {
  padding: 10px;
  display: flex;
}
#main {
  display: flex;
  padding: 10px;
}
.title {
  flex: 1;
}
.switch-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}
.switch-wrapper, .credits-button-wrapper {
  padding-left: 10px;
}
span.wh {
  padding-right: 10px;
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
