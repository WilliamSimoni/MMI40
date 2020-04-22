require('dotenv').config();
const moment = require('moment');
const { Safe } = require('../../STUB/FIBO_modules/safe');
const { IoTData } = require('./getIotData');

const iotData = new IoTData();

class NothingFound extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

async function aggregation(aggrFun, projectName, tags, fleets, values, start, end, periods) {
    let response;
    try {
        response = await iotData.getData(projectName, tags, fleets, start, end, 2);
        if (!response.result) {
            throw new NothingFound('nothing found');
        } else {
            response = response.result;
        }
    } catch (err) {
        if (!err instanceof NothingFound) {
            console.error(err)
        }
        let finalResult = [];
        for (let value of values) {
            finalResult.push({ tags, value, timeSeries: [] });
        }
        return {finalResult, invalid: []};
    }
    
    let aggrCallback;

    switch (aggrFun) {
        case 'sum': aggrCallback = sum; break;
        case 'mean': aggrCallback = mean; break;
        case 'min': aggrCallback = min; break;
        case 'max': aggrCallback = max; break;
    }
        
    let aggrResult = [];
    for (let item of periods) {
        aggrResult.push(aggrCallback(response, values, item));
    }
    let finalResult = [];
    let invalid = [];

    for (let item of aggrResult) {
        for (let value of values) {
            if (response.length > 0) {
                if (response[0].payload[value]) {
                    finalResult.push({ tags, value, timeSeries: item.result[value]});
                    invalid.push({ tags, value, timeSeries: item.invalid[value] });
                }
            }
        }
    }

    return {finalResult, invalid};
}

function sum(data, values, periods) {
    let tmp = {};
    let counter = {};
    let result = {};
    let invalid = {};

    for (let value of values) {
        tmp[value] = 0;
        counter[value] = periods.length - 1;
        result[value] = [];
        invalid[value] = [];
    }

    for (let item of data) {
        for (let value of values) {
            if (item.payload[value]) {
                while (periods[counter[value]] > moment(item.timestamp_device).unix()) {
                    if (tmp[value] !== 0) {
                        result[value].push({ time: periods[counter[value]], value: tmp[value] })
                    } else {
                        invalid[value].push({time: periods[counter[value]]})
                    }
                    tmp[value] = 0;
                    counter[value]--;
                }
                tmp[value] += item.payload[value];
            }
        }
    }

    return {result, invalid};
}

function mean(data, values, periods) {
    let sum = {};
    let counterSum = {};
    let counter = {};
    let result = {};
    let invalid = {};

    for (let value of values) {
        sum[value] = 0;
        counterSum[value] = 0;
        counter[value] = periods.length - 1;
        result[value] = [];
        invalid[value] = [];
    }

    for (let item of data) {
        for (let value of values) {
            if (item.payload[value]) {
                

                while (periods[counter[value]] > moment(item.timestamp_device).unix()) {
                    let mean;

                    if (counterSum[value] > 0) {
                        mean = sum[value] / counterSum[value];
                        result[value].push({ time: periods[counter[value]], value: mean })
                    } else {
                        invalid[value].push({time: periods[counter[value]]})
                    }

                    sum[value] = 0;
                    counterSum[value] = 0;
                    counter[value]--;
                }

                sum[value] += item.payload[value];
                counterSum[value] += 1;
                
            }
        }
    }

    return {result, invalid};
}


function min(data, values, periods) {
    let tmp = {};
    let counter = {};
    let result = {};
    let invalid = {};

    for (let value of values) {
        counter[value] = periods.length - 1;
        result[value] = [];
        invalid[value] = [];
    }

    for (let item of data) {
        for (let value of values) {
            if (item.payload[value]) {
                while (periods[counter[value]] > moment(item.timestamp_device).unix()) {

                    if (tmp[value]) {
                        result[value].push({ time: periods[counter[value]], value: tmp[value] })
                        delete tmp[value]
                    } else {
                        invalid[value].push({time: periods[counter[value]]})
                    }
                    
                    counter[value]--;
                }
                if (!tmp[value]) {
                    tmp[value] = item.payload[value];
                } else {
                    if (tmp[value] > item.payload[value]) {
                        tmp[value] = item.payload[value];
                    }
                }
            }
        }
    }


    return {result, invalid};
}

function max(data, values, periods) {
    let tmp = {};
    let counter = {};
    let result = {};
    let invalid = {};

    for (let value of values) {
        counter[value] = periods.length - 1;
        result[value] = [];
        invalid[value] = [];
    }

    for (let item of data) {
        for (let value of values) {
            if (item.payload[value]) {
                while (periods[counter[value]] > moment(item.timestamp_device).unix()) {

                    if (tmp[value]) {
                        result[value].push({ time: periods[counter[value]], value: tmp[value] })
                        delete tmp[value]
                    } else {
                        invalid[value].push({time: periods[counter[value]]})
                    }

                    counter[value]--;
                }
                if (!tmp[value]) {
                    tmp[value] = item.payload[value];
                } else {
                    if (tmp[value] < item.payload[value]) {
                        tmp[value] = item.payload[value];
                    }
                }
            }
        }
    }

    return {result, invalid};
}

/*
aggregation('mean', 'simoni', ['bagno', 'camera'], ['flt-4tera0062rzy'], ['temp', 'humidity'], null, null)
    .then(res => { console.log(res) })
    .catch(err => console.error(err));
*/

exports.aggregation = aggregation;