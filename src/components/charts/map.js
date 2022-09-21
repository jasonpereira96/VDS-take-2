import { select, zoom, create, geoPath, json, zoomIdentity, pointer, zoomTransform, geoAlbers, scaleSqrt } from "d3";
import { scaleSequential, interpolatePiYG, interpolatePuRd, range } from "d3";
import us_data from "./../../data/counties-albers-10m.json";
import { getFreqByState, getFreqBySex, getFreqByCity, getStateCode } from "./../../utils/process"
import circlarLegend from "./circularLegend"
import stateMapping from "./../../data/stateCodes"
import legend from "./legend";

// const topojson = require("topojson-client");

import * as topojson from "topojson-client";

let us = us_data

// create path variable

// var projection = geoMercator();
// var path = gepath()
// .projection(projection);
const path = geoPath();
let projection = geoAlbers().scale(1300).translate([487.5, 305]);


let radius = scaleSqrt([0, Math.max(...getFreqByCity().map(r => r.count))], [0, 40]); // 40 is maxRadius



const _d3 = {
  select, zoom, create, geoPath, json, zoomIdentity, pointer, zoomTransform
}




export default function map(data, {
  width = 975,
  height = 610,
  showBubbles = false,
  useSqrtScale = true,
  cScale,
  isGenderFilterActive = false,
  vueChart
}) {

  const stateFreq = getFreqByState(data);

  const zoom = _d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

  const svg = _d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height)
    .on("click", reset);

  const g = svg.append("g");

  // var cScale = scaleSequential()
    // .domain([Math.min(...Object.values(stateFreq)), Math.max(...Object.values(stateFreq))])
    // .interpolator(interpolator);


 
  
  g.append("path")
    .attr("fill", "none")
    .attr("stroke", "white")
    // .attr("fill", (d, i) => color(50))
    .attr("stroke-linejoin", "round")
    .attr("d", path(topojson.mesh(us, us.objects.states, (a, b) => a !== b)))


  // svg.append("path")
  //     .datum(getHotspots())
  //     .attr("d", _d3.geoPath(projection).pointRadius(20));


  if (showBubbles) {
    const deathsByCity = getFreqByCity(data);

    const bubbleScale = useSqrtScale ? scaleSqrt([0, Math.max(...deathsByCity.map(r => r.count))], [0, 40]) // 40 is maxRadius
      : scaleSequential([0, Math.max(...deathsByCity.map(r => r.count))], [0, 40]);

    // add circles to svg
    svg.selectAll("circle")
      // .data([aaa, bbb]).enter()
      .data(deathsByCity).enter()
      .append("circle")
      .attr("cx", function (d) { return projection([d.lng, d.lat])[0]; })
      .attr("cy", function (d) { return projection([d.lng, d.lat])[1]; })
      .attr("r", function (d) { return bubbleScale(d.count) })
      .attr("class", "city-circle")
      .attr("fill", "red")
      .attr("fill-opacity", 0.5)
      .append("title").text(d => d.city);


    circlarLegend(svg, {
      width,
      height,
      radius: bubbleScale
    });
  }

  let fillFunction, freqBySex;
  if (isGenderFilterActive) {
    freqBySex = getFreqBySex(data);
    fillFunction = (d, i) => {
      let m = freqBySex[getStateCode(d.properties.name)]?.M;
      if (!m) return;

      let f = freqBySex[getStateCode(d.properties.name)].F;

      return cScale((1 - (f / (m + f))) * 100);
    };
  } else {
    fillFunction = (d, i) => cScale(stateFreq[getStateCode(d.properties.name)] === undefined ? 0 : stateFreq[getStateCode(d.properties.name)]);
  }

  let x = topojson.feature(us, us.objects.states).features;
  const states = g.append("g")
  .attr("cursor", "pointer")
  .selectAll("path")
  .data(topojson.feature(us, us.objects.states).features)
  .join("path")
  .attr("fill", fillFunction)
  .on("click", onClick)
  .attr("d", path);

  states.append("title")
    .text(d => d.properties.name);


  function reset() {
    states.transition().style("fill", null);
    svg.transition().duration(750).call(
      zoom.transform,
      _d3.zoomIdentity,
      _d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
    );
  }

  function onClick(event, d) {
    vueChart.$emit("state-clicked", d.properties.name);
    const [[x0, y0], [x1, y1]] = path.bounds(d);
    event.stopPropagation();
  }

  function zoomed(event) {
    const { transform } = event;
    g.attr("transform", transform);
    g.attr("stroke-width", 1 / transform.k);
  }

  return svg.node();
}