const { time, rounder, keyEnumeration, timeConverter } = require('../custom-modules/time');

const { divide } = require('mathjs');

const moment = require('moment');

function method1(granularity, timeRange, start, end) {

    const now = time.now();
    
    let timeSeriesStart;

    let past;

    if (timeRange) {
        past = time.subtract(now, timeRange.number, timeRange.key);
    } else {
        past = start;
    }
    
    const granularityInSecond = timeConverter.convertSecond(granularity.number, granularity.key);

    const rawMomentStart = (Math.floor(divide(past, granularityInSecond)) * granularityInSecond);

    const nearMomentStart = time.nearestMoment(rawMomentStart, granularity.number, granularity.key, past);

    const roundMomentStart = time.round(nearMomentStart, granularity.key);

    if (start && timeRange) {
        start = time.round(start, granularity.key);
        timeSeriesStart = time.nearestMoment(roundMomentStart, granularity.number, granularity.key, start);
    } else {
        timeSeriesStart = roundMomentStart;
    }

    if (!end) {
        end = now;
    }

    const rawMomentEnd = (Math.floor(divide(end, granularityInSecond)) * granularityInSecond);

    const nearMomentEnd = time.nearestMoment(rawMomentEnd , granularity.number, granularity.key, end);

    const roundMomentEnd = time.round(nearMomentEnd, granularity.key);

    return { start: timeSeriesStart, end: roundMomentEnd };
}

function method2(granularity, timeRange, start, end) {
    const now = time.now();

    //timeSeriesStart is the beginning of the time series that will be sent to the Client.
    let timeSeriesStart;

    //defining timeSeriesStart
    if (timeRange) {
        timeSeriesStart = time.subtract(now, timeRange.number, timeRange.key);
    } else {
        timeSeriesStart = start;
    }

    //rounding timeSeriesStart at the beginning of the minute, hour, ... according to the value returned by rounder.roundPerTimeRange
    const minGranularity = rounder.roundPerTimeRange(now, timeSeriesStart);

    let granularityRoundFactor;
    if (keyEnumeration[minGranularity] < keyEnumeration[granularity.key]) {
        granularityRoundFactor = granularity.key;
    } else {
        granularityRoundFactor = minGranularity;
    }

    //rounding granularity by roundFactor
    granularity = rounder.roundGranularity(granularity.number, granularity.key, granularityRoundFactor);

    let timeSeriesRoundFactor = rounder.roundPerGranularity(timeConverter.convertSecond(granularity.number, granularity.key));

    //if start is defined then timeSeriesStart is increased to the closest moment to rounded start

    timeSeriesStart = time.nearestMoment(time.round(timeSeriesStart, timeSeriesRoundFactor), granularity.number, granularity.key, timeSeriesStart);

    if (start && timeRange) {

        start = time.round(start, granularityRoundFactor);

        timeSeriesStart = time.nearestMoment(timeSeriesStart, granularity.number, granularity.key, start);
    }

    //defining end
    if (!end) {
        end = time.nearestMoment(time.round(now, timeSeriesRoundFactor), granularity.number, granularity.key, now);
    } else {
        end = time.nearestMoment(time.round(end, timeSeriesRoundFactor), granularity.number, granularity.key, end);
    }

    return { start: timeSeriesStart, end: end };
}

/*
console.log(method2({ key: 'minute', number: 7 }, { number: 19, key: 'minute' }));

for (el in keyEnumeration) {
    for (let i = 1; i < 2; i++) {
        for (el2 in keyEnumeration) {
            for (let j = 6; j < 10; j++) {
                const res1 = method1({ key: el, number: i }, { number: j, key: el2 });
                const res2 = method2({ key: el, number: i }, { number: j, key: el2 });
                if (res1.start !== res2.start || res2.end !== res2.end){
                    console.log(`gran: {${el}, ${i}}, range: {${el2}, ${j}}`);
                    console.log('method1', res1);
                    console.log('method2', res2);
                }
            }
        }

    }
}*/
/*
const granularity = { number: 2, key: 'hour' };
const timeRange = { key: 'hour', number: 7 };

const result = method1(granularity, timeRange);

console.log(result);

console.log(time.createPeriods(result.start, granularity.number, granularity.key, result.end));


console.log(time.createPeriods(time.round(time.add(result.start, 1, 'hour'), 'hour'), 1, 'hour', time.round(result.end, 'hour')))
console.log(time.createPeriods(result.start, 1, 'hour', time.round(result.end, 'hour')))
*/
/*
const start = Date.now()
console.log((past/granularityInSecond));
console.log(past);
console.log(Math.floor((past/granularityInSecond)) * granularityInSecond);
console.log(Date.now() - start);

                console.log('method1')
                console.log(`gran: {${el}, ${i}}, range: {${el2}, ${j}}`);
                console.log(method1({ key: el, number: i }, { number: j, key: el2 }));
                */
let a = [1,2,3];
let b = [3,4,5];
let c = a.splice(1,0,b);
console.log(a);