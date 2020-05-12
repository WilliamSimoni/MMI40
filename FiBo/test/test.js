const { sum, max, min, mean } = require('mathjs');

function mergeTwoInvalidTimeSeries(timeSeries1, timeSeries2){
    const result = [];
    const length1 = timeSeries1.length;
    const length2 = timeSeries2.length;

    //i for timeSeries1 and j for timeSeries2
    let i = 0, j = 0;

    while (i < length1 && j < length2) {
        //console.log(i, j, length1, length2);
        const time1 = timeSeries1[i].time;
        const time2 = timeSeries2[j].time;
        if (time1 !== time2) {
            const maxTime = max(time1, time2);
            if (maxTime === time1) {
                j++;
            } else {
                i++;
            }
        } else {
            result.push({ time: time1 });
            i++; j++;
        }
    }

    return result;
}
function mergeTwoTimeSeries(timeSeries1, timeSeries2, aggregationFunction) {
    const result = [];

    const length1 = timeSeries1.length;
    const length2 = timeSeries2.length;

    //i for timeSeries1 and j for timeSeries2
    let i = 0, j = 0;


    while (i < length1 && j < length2) {
        const time1 = timeSeries1[i].time;
        const time2 = timeSeries2[j].time;
        console.log('i', i, '=', time1);
        console.log('j', j, '=', time2);
        if (time1 !== time2) {
            const maxtime = max(time1, time2);
            if (maxtime === time1) {
                result.push(timeSeries1[i]);
                i++;
            } else {
                result.push(timeSeries2[j]);
                j++;
            }
        } else {
            console.log(time1)
            const aggregated = aggregationFunction(timeSeries1[i].value, timeSeries2[j].value);
            result.push({ time: time1, value: aggregated });
            i++; j++;
        }
    }

    console.log(i,j);

    if (i < length1) {
        for (let t = i; t < length1; t++) {
            result.push(timeSeries1[t]);
        }
    }

    if (j < length2) {
        for (let t = j; t < length2; t++) {
            result.push(timeSeries2[t]);
        }
    }

    return result;

}

const test1 = [
    { time: 1, value: 20 },
    { time: 2, value: 20 },
    { time: 3, value: 20 },
    { time: 5, value: 20 },
    { time: 7, value: 20 },
    { time: 9, value: 20 },
    { time: 10, value: 20 },
    { time: 11, value: 20 },
    { time: 12, value: 20 },
    { time: 14, value: 20 },
    { time: 15, value: 20 },
    { time: 16, value: 20 },
]

const test2 = [
    { time: 2, value: 10 },
    { time: 3, value: 10 },
    { time: 4, value: 10 },
    { time: 5, value: 10 },
    { time: 6, value: 10 },
    { time: 9, value: 10 },
    { time: 10, value: 10 },
    { time: 12, value: 10 },
    { time: 14, value: 10 },
    { time: 15, value: 10 },
    { time: 16, value: 10 },
]

const test3 = [
    { time: 1588775160, value: 1 },
    { time: 1588775040, value: 1 },
    { time: 1588774920, value: 1 },
    { time: 1588774800, value: 1 },
    { time: 1588774680, value: 1 },
    { time: 1588774560, value: 1 },
    { time: 1588774440, value: 1 },
    { time: 1588774320, value: 1 },
    { time: 1588774200, value: 1 }
  ]

const test4 = [
    { time: 1588775280, value: 20 },
    { time: 1588775160, value: 13.5 },
    { time: 1588775040, value: 16.5 },
    { time: 1588774920, value: 15 },
    { time: 1588774800, value: 14.25 },
    { time: 1588774680, value: 21 },
    { time: 1588774560, value: 17 },
    { time: 1588774440, value: 14.75 },
    { time: 1588774320, value: 18.75 },
    { time: 1588774200, value: 15.333333333333334 }
  ]

//console.log(mergeTwoTimeSeries(test1.sort((a,b) => b.time - a.time),test2.sort((a,b) => b.time - a.time), max));

console.log(mergeTwoTimeSeries(test3, test4, mean));