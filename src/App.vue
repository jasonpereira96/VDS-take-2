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
    },
    title() {
      return this.isBlackHat ? "California leads the charge in gun violence!" : "Gun deaths in the US"
    },
    bodyClass() {
      return this.isBlackHat ? "dark" : ""
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
    <title>Gun Deaths in the US</title>
    <meta charset="UTF-8">
    <meta http-equiv="cache-control" content="no-cache" />
    <meta http-equiv="pragma" content="no-cache" />
    <meta http-equiv="content-type" content="text/html; charset=UTF-8">
    <meta name="viewport"
      content="width=device-width,user-scalable=0,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0">
  </head>

  <body :class="bodyClass">
    <div id="app">
      <div class="main-navbar">
        <div class="title"> <h2>{{ title }} </h2></div>
        <div class="switch-wrapper">
          <span class="wh">White Hat</span>
          <b-form-checkbox v-model="isBlackHat" switch size="lg"></b-form-checkbox>
          <span>Black Hat</span>
        </div>
        <div class="credits-button-wrapper">
          <b-button class="btn-warning" @click="onCreditsClick">Credits and Write-ups</b-button>
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
          <b-form-checkbox v-if= "!isBlackHat" v-model="normalize" switch><b>Normalize by state population</b></b-form-checkbox>
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
    <b-modal id="modal-1" title="Credits and Write-ups" v-model="creditsModalOpen" hide-footer size="lg">
      <h3>Credits</h3>
      <p class="my-4">The following resources were used and referenced while building this site:</p>
      <ul>
        <li><a target="_blank" href="https://observablehq.com/@d3/gallery">D3 Gallery</a></li>
        <li><a target="_blank" href="https://d3js.org/">D3 Docs</a></li>
        <li><a target="_blank" href="https://vuejs.org/guide/introduction.html">Vue JS</a></li>
        <li><a target="_blank" href="https://github.com/cdmoro/bootstrap-vue-3">Bootstrap</a></li>
        <li><a target="_blank" href="https://github.com/topojson/us-atlas">Github for Map data</a></li>
      </ul>
      <h3>Visual encoding:</h3>
      <ul>
        <li>
          I have used a bubble map to plot death data by city.
        </li>
        <li>
          A chloropleth map to plot deaths by state.
        </li>
        <li>
          For gender distribution, as there are only 2 genders, I have used a pie chart because that seemed by far the
          most intuitive and easy to understand way to plot gender distribution.
        </li>
        <li>
          I have used a histogram to plot age distribution which gives the user a birds-eye view of 
          the distribution of deaths by age.
        </li>
      </ul>
      <h3>Black Hat</h3>
      <p class="my-4">Reasons why this visualization is black hat and misleading:</p>
      <ul>
        <li>Use of <b>logrimathic scale for colour encoding</b> which is confusing and misleading to users. 
        Most of the general public are not familiar with the logrimathic scale. Combining that with a color encoding
        makes the number of gun deaths in most states look greater than they actually are and confuses the hell out of the viewer.
        It also makes the difference between gun death rates between states hard to comprehend.
        </li>
        <li>
        Use of a <b>linear scale to plot the radius of the circle</b>, rather than a square root scale. Since the area of a circle marker
        denotes the relative value of that quantity, a scale that is propotional to the area of the marker (a square root scale)
        would be appropriate for this use case. However, I have used a linear scale in the black hat version which is misleading.
        </li>
        <li>
        Has a <b>misleading title</b> which will skew the viewer's perception of the viz before they even look at it.
        </li>
        <li>
        <b>Data is not normalized by population. </b>This results in a distribution of gun deaths that mimics the population
        distribution of the US. In the white hat version, there is option for the user to view a normalized view of the data.
        </li>
      </ul>
      <h3>White Hat</h3>
      <p class="my-4">Reasons why this visualization is white hat:</p>
      <ul>
        <li>
          Used a linear scale for colour encoding for the chloropleth.
        </li>
        <li>
        Used a square root scale to compute the value of the radius of the circle. This makes the area of the circle marker actually
        propotional to the value of the data point.
        </li>
        <li>
        Has a neutral title that does not mislead the viewer.
        </li>
        <li>
        There is a switch which gives the viewer an option to view the data normalized by state population. This ensures that the viewer
        does not conclude that states with larger populations, like California or New York actually have high gun death rates. Of course,
        the viewer can view total deaths as well.
        </li>
      </ul>
    </b-modal>
  </body>
</template>

<style scoped>
body {
}
.main-navbar {
  padding: 10px;
  color: white;
  display: flex;
  background-color: darkblue;
}
.dark .main-navbar {
  background-color: crimson;
}

button {
  /* background-color: crimson; */
  font-weight: bold;
}
.dark button {
  /* background-color: darkblue; */
}
#main {
  display: flex;
  padding: 10px;
}
.title {
  flex: 1;
}
.switch-wrapper, .credits-button-wrapper {
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
#main .form-check.form-switch {
  background-color: khaki;
}
</style>
