
const moment = require('moment');

const { mergeTimeSeries, mergeInvalidTimeSeries } = require('./internalAggregation');

const {sum, max, min, mean} = require('mathjs');

function sumFun(dataGroups, couples, data, periods) {

    let tmp = [];

    //
    // setting initial values for every couple
    //

    for (let couple of couples) {
        let coupleTempData = [];
        for (let period of periods) {
            const tmpdataPeriod = {
                sum: null,
                timeCounter: period.length - 1,
                result: [],
                invalid: []
            }
            coupleTempData.push(tmpdataPeriod);
        }
        tmp.push(coupleTempData);
    }

    //
    // Not Empty Periods is an array which contains only periods with length > 0
    //

    notEmptyPeriods = periods.filter(el => el.length > 0);

    //
    // for each item in the payload sent by ZDM.
    //

    for (let item of data) {

        //
        // for each couple (tag,value)
        //

        for (let i = 0; i < couples.length; i++) {

            //
            // if condition is true if the single item has tag equal to couple.tag and it has a payload which contains the couple.value
            //

            if (item.tag === couples[i].tag && item.payload[couples[i].value]) {

                //
                // for each not Empty Period
                //

                for (let j = 0; j < notEmptyPeriods.length; j++) {

                    const coupleTmpData = tmp[i][j];

                    //console.log(coupleTmpData.timeCounter, notEmptyPeriods[j][coupleTmpData.timeCounter], moment.utc(item.timestamp_device).unix());

                    while (notEmptyPeriods[j][coupleTmpData.timeCounter] > moment.utc(item.timestamp_device).unix() && coupleTmpData.timeCounter > 0) {

                        //
                        // if at least one element is added up in a single period, then the sum is pushed in result array
                        //

                        if (coupleTmpData.sum) {
                            coupleTmpData.result.push({ time: notEmptyPeriods[j][coupleTmpData.timeCounter], value: coupleTmpData.sum });
                            coupleTmpData.sum = null;
                        } else {
                            coupleTmpData.invalid.push({ time: notEmptyPeriods[j][coupleTmpData.timeCounter] });
                        }

                        if (coupleTmpData.timeCounter > 0)
                            coupleTmpData.timeCounter--;

                    }

                    if (!coupleTmpData.sum)
                        coupleTmpData.sum = 0;

                    coupleTmpData.sum += item.payload[couples[i].value];

                }
            }
        }
    }

    //
    //inserting data about last sub-period in every not empty period
    //

    for (let i = 0; i < couples.length; i++) {

        for (let j = 0; j < notEmptyPeriods.length; j++) {
            const coupleTmpData = tmp[i][j];

            if (coupleTmpData.sum) {
                coupleTmpData.result.push({ time: notEmptyPeriods[j][coupleTmpData.timeCounter], value: coupleTmpData.sum });
            } else {
                coupleTmpData.invalid.push({ time: notEmptyPeriods[coupleTmpData.timeCounter] });
            }

            coupleTmpData.timeCounter--;

            while (coupleTmpData.timeCounter >= 0) {
                coupleTmpData.invalid.push({ time: notEmptyPeriods[j][coupleTmpData.timeCounter] });
                coupleTmpData.timeCounter--;
            }

        }
    }

    let dataGroupAggregationResult = internalAggregation(tmp, dataGroups, periods);

    return dataGroupAggregationResult;
}

function meanFun(dataGroups, couples, data, periods) {

    let tmp = [];

    //
    // setting initial values for every couple and 
    //

    for (let couple of couples) {
        let coupleTempData = [];
        for (let period of periods) {
            const tmpdataPeriod = {
                sum: 0,
                elCounter: null,
                timeCounter: period.length - 1,
                result: [],
                invalid: []
            }
            coupleTempData.push(tmpdataPeriod);
        }
        tmp.push(coupleTempData);
    }

    notEmptyPeriods = periods.filter(el => el.length > 0);

    for (let item of data) {

        for (let i = 0; i < couples.length; i++) {

            if (item.tag === couples[i].tag && item.payload[couples[i].value]) {

                for (let j = 0; j < notEmptyPeriods.length; j++) {

                    const coupleTmpData = tmp[i][j];

                    //console.log(coupleTmpData.timeCounter, notEmptyPeriods[j][coupleTmpData.timeCounter], moment.utc(item.timestamp_device).unix());

                    while (notEmptyPeriods[j][coupleTmpData.timeCounter] > moment.utc(item.timestamp_device).unix() && coupleTmpData.timeCounter > 0) {

                        if (coupleTmpData.elCounter) {
                            const mean = coupleTmpData.sum / coupleTmpData.elCounter
                            coupleTmpData.result.push({ time: notEmptyPeriods[j][coupleTmpData.timeCounter], value: mean });
                            coupleTmpData.sum = 0;
                            coupleTmpData.elCounter = null;
                        } else {
                            coupleTmpData.invalid.push({ time: notEmptyPeriods[j][coupleTmpData.timeCounter] });
                        }

                        if (coupleTmpData.timeCounter > 0)
                            coupleTmpData.timeCounter--;

                    }

                    coupleTmpData.sum += item.payload[couples[i].value];

                    if (!coupleTmpData.elCounter)
                        coupleTmpData.elCounter = 1;
                    else 
                        coupleTmpData.elCounter++;

                }
            }
        }
    }

    //
    //inserting data about last sub-period in every not empty period
    //

    for (let i = 0; i < couples.length; i++) {

        for (let j = 0; j < notEmptyPeriods.length; j++) {
            const coupleTmpData = tmp[i][j];

            if (coupleTmpData.elCounter) {
                const mean = coupleTmpData.sum / coupleTmpData.elCounter
                coupleTmpData.result.push({ time: notEmptyPeriods[j][coupleTmpData.timeCounter], value: mean });
            } else {
                coupleTmpData.invalid.push({ time: notEmptyPeriods[j][coupleTmpData.timeCounter] });
            }

            coupleTmpData.timeCounter--;

            while (coupleTmpData.timeCounter >= 0) {
                coupleTmpData.invalid.push({ time: notEmptyPeriods[j][coupleTmpData.timeCounter] });
                coupleTmpData.timeCounter--;
            }

        }
    }

    let dataGroupAggregationResult = internalAggregation(tmp, dataGroups, periods);

    return dataGroupAggregationResult;
}

function minFun(dataGroups, couples, data, periods) {

    let tmp = [];

    //
    // setting initial values for every couple and 
    //

    for (let couple of couples) {
        let coupleTempData = [];
        for (let period of periods) {
            const tmpdataPeriod = {
                min: null,
                timeCounter: period.length - 1,
                result: [],
                invalid: []
            }
            coupleTempData.push(tmpdataPeriod);
        }
        tmp.push(coupleTempData);
    }

    notEmptyPeriods = periods.filter(el => el.length > 0);

    for (let item of data) {

        for (let i = 0; i < couples.length; i++) {

            if (item.tag === couples[i].tag && item.payload[couples[i].value]) {

                for (let j = 0; j < notEmptyPeriods.length; j++) {

                    const coupleTmpData = tmp[i][j];

                    //console.log(coupleTmpData.timeCounter, notEmptyPeriods[j][coupleTmpData.timeCounter], moment.utc(item.timestamp_device).unix());

                    while (notEmptyPeriods[j][coupleTmpData.timeCounter] > moment.utc(item.timestamp_device).unix() && coupleTmpData.timeCounter > 0) {
                        if (coupleTmpData.min) {
                            coupleTmpData.result.push({ time: notEmptyPeriods[j][coupleTmpData.timeCounter], value: coupleTmpData.min });
                            coupleTmpData.min = null;
                        } else {
                            coupleTmpData.invalid.push({ time: notEmptyPeriods[j][coupleTmpData.timeCounter] });
                        }

                        if (coupleTmpData.timeCounter > 0)
                            coupleTmpData.timeCounter--;

                    }

                    if (!coupleTmpData.min){
                        coupleTmpData.min = item.payload[couples[i].value];
                    } else {
                        if (coupleTmpData.min > item.payload[couples[i].value]){
                            coupleTmpData.min = item.payload[couples[i].value];
                        }
                    }

                }
            }
        }
    }

    //
    //inserting data about last sub-period in every not empty period
    //

    for (let i = 0; i < couples.length; i++) {

        for (let j = 0; j < notEmptyPeriods.length; j++) {
            const coupleTmpData = tmp[i][j];

            if (coupleTmpData.min) {
                coupleTmpData.result.push({ time: notEmptyPeriods[j][coupleTmpData.timeCounter], value: coupleTmpData.min });
                coupleTmpData.min = null;
            } else {
                coupleTmpData.invalid.push({ time: notEmptyPeriods[j][coupleTmpData.timeCounter] });
            }

            coupleTmpData.timeCounter--;

            while (coupleTmpData.timeCounter >= 0) {
                coupleTmpData.invalid.push({ time: notEmptyPeriods[j][coupleTmpData.timeCounter] });
                coupleTmpData.timeCounter--;
            }

        }
    }

    let dataGroupAggregationResult = internalAggregation(tmp, dataGroups, periods);

    return dataGroupAggregationResult;
}

function maxFun(dataGroups, couples, data, periods) {

    let tmp = [];

    //
    // setting initial values for every couple and 
    //

    for (let couple of couples) {
        let coupleTempData = [];
        for (let period of periods) {
            const tmpdataPeriod = {
                max: null,
                timeCounter: period.length - 1,
                result: [],
                invalid: []
            }
            coupleTempData.push(tmpdataPeriod);
        }
        tmp.push(coupleTempData);
    }

    notEmptyPeriods = periods.filter(el => el.length > 0);

    for (let item of data) {

        for (let i = 0; i < couples.length; i++) {

            if (item.tag === couples[i].tag && item.payload[couples[i].value]) {

                for (let j = 0; j < notEmptyPeriods.length; j++) {

                    const coupleTmpData = tmp[i][j];

                    //console.log(coupleTmpData.timeCounter, notEmptyPeriods[j][coupleTmpData.timeCounter], moment.utc(item.timestamp_device).unix());

                    while (notEmptyPeriods[j][coupleTmpData.timeCounter] > moment.utc(item.timestamp_device).unix() && coupleTmpData.timeCounter > 0) {
                        if (coupleTmpData.max) {
                            coupleTmpData.result.push({ time: notEmptyPeriods[j][coupleTmpData.timeCounter], value: coupleTmpData.max });
                            coupleTmpData.max = null;
                        } else {
                            coupleTmpData.invalid.push({ time: notEmptyPeriods[j][coupleTmpData.timeCounter] });
                        }

                        if (coupleTmpData.timeCounter > 0)
                            coupleTmpData.timeCounter--;

                    }

                    if (!coupleTmpData.max){
                        coupleTmpData.max = item.payload[couples[i].value];
                    } else {
                        if (coupleTmpData.max < item.payload[couples[i].value]){
                            coupleTmpData.max = item.payload[couples[i].value];
                        }
                    }

                }
            }
        }
    }

    //
    //inserting data about last sub-period in every not empty period
    //

    for (let i = 0; i < couples.length; i++) {

        for (let j = 0; j < notEmptyPeriods.length; j++) {
            const coupleTmpData = tmp[i][j];

            if (coupleTmpData.max) {
                coupleTmpData.result.push({ time: notEmptyPeriods[j][coupleTmpData.timeCounter], value: coupleTmpData.max });
                coupleTmpData.max = null;
            } else {
                coupleTmpData.invalid.push({ time: notEmptyPeriods[j][coupleTmpData.timeCounter] });
            }

            coupleTmpData.timeCounter--;

            while (coupleTmpData.timeCounter >= 0) {
                coupleTmpData.invalid.push({ time: notEmptyPeriods[j][coupleTmpData.timeCounter] });
                coupleTmpData.timeCounter--;
            }

        }
    }

    let dataGroupAggregationResult = internalAggregation(tmp, dataGroups, periods);

    return dataGroupAggregationResult;
}

function internalAggregation(tmp, dataGroups, periods){
    let dataGroupAggregationResult = [];

    for (let i = 0; i < dataGroups.length; i++) {

        dataGroupAggregationResult.push({result: [], invalid: []});

        let aggrFunCallBack = sum;

        switch(dataGroups[i].aggrFun){
            case 'sum': aggrFunCallBack = sum; break;
            case 'min': aggrFunCallBack = min; break;
            case 'max': aggrFunCallBack = max; break;
            case 'mean': aggrFunCallBack = mean; break;
        }


        for (let j = 0; j < periods.length; j++) {
            let dataGroupSeriesResult = [];
            let dataGroupSeriesInvalid = [];

            for (let couple of dataGroups[i].couples) {
                dataGroupSeriesResult.push(tmp[couple][j].result);
                dataGroupSeriesInvalid.push(tmp[couple][j].invalid);
            }

            dataGroupAggregationResult[i].result.push(mergeTimeSeries(dataGroupSeriesResult, aggrFunCallBack));
            dataGroupAggregationResult[i].invalid.push(mergeInvalidTimeSeries(dataGroupSeriesInvalid));

        }
    }

    return dataGroupAggregationResult;

}

exports.sum = sumFun;
exports.mean = meanFun;
exports.min = minFun;
exports.max = maxFun;