import gunDeaths from "./../data/gun-deaths.json"
import _ from "lodash"
import stateCodes from "../data/stateCodes";



export function getFreqByState(records) {
    return records.reduce((acc, record) => {
        if (acc[record.state] === undefined) {
            acc[record.state] = 1;
        } else {
            acc[record.state]++;
        }
        return acc;
    }, {});
}

export function getFreqBySex(records) {
    let acc = records.reduce((acc, record) => {
        acc[record.state] = {
            M: 0,
            F: 0
        };
        return acc;
    }, {})

    return records.reduce((acc1, record) => {
        if (record.gender === "M") {
            acc1[record.state].M++;
        } else {
            acc1[record.state].F++;
        }
        return acc1;
    }, acc);
}


export function getFreqByCity(records) {

    let groupedByCity = _.groupBy(records, record => record.city);

    return Object.entries(groupedByCity).map(([city, records]) => {
        return {
            city,
            lat: records[0].lat,
            lng: records[0].lng,
            state: records[0].state,
            count: records.length
        };
    });
}

export function getStateCode(stateName) {
    return stateCodes[stateName];
}