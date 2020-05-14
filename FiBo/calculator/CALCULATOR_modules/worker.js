

//
//aggregation functions
//

const coupleAggregationFun = require('./aggregateCouple');

const dataGroupAggregationFun = require('./aggregateDataGroup');

const { mean } = require('mathjs');

const { mergeTwoTimeSeries } = require('./internalAggregation');

//
// For create task
//

const { ThreadWorker } = require('poolifier')

//
// time manipulation
//

const { time } = require('../../custom-modules/time');

/**
 * @typedef DataGroup
 * @type {Object[]}
 * @property {string} aggrFun - internal aggregation function to apply to data.
 * @property {string[]} couples - list of index. index i is refered to i-th couple in structure couples
 */

/**
* @typedef Couple
* @type {Object[]}
* @property {string} tag - couple tag.
* @property {string} value - couple value.
*/


/**
 * aggregate data
 * @param {Object} data - data used by the worker to choose aggregation function and which contain data and periods.
 * @param {string} data.fname - aggregation function name
 * @param {DataGroup} data.dataGroup - array where every item contains internal aggregation function and couple indexes.
 * @param {Couple} data.couples - array of couple tag-value. 
 * @param {Object[]} data.data - data sent by ZDM for different periods. i-th element is about i-th period in data.dividedPeriods.
 * @param {Object[]}  data.dividedPeriods - different periods with different divisions.
 * @param {Object[]} mainPeriods
 * @param {Object[]}  data.backupData
 * @param {Object} granularity
 */

function aggregate(data) {
    let coupleAggregationCallback;
    let dataGroupAggregationCallback;


    switch (data.fname) {
        case 'sum': {
            coupleAggregationCallback = coupleAggregationFun.sum;
            dataGroupAggregationCallback = dataGroupAggregationFun.sum;
            break;
        }
        case 'mean': {
            coupleAggregationCallback = coupleAggregationFun.mean;
            dataGroupAggregationCallback = dataGroupAggregationFun.mean;
            break;
        }
        case 'max': {
            coupleAggregationCallback = coupleAggregationFun.max;
            dataGroupAggregationCallback = dataGroupAggregationFun.max;
            break
        }
        case 'min': {
            coupleAggregationCallback = coupleAggregationFun.min; 
            dataGroupAggregationCallback = dataGroupAggregationFun.min; 
            break;
        }
    }

    let aggregatedData = [];

    let dataGroupAggregation = [];

    let dividedMainPeriods = [];

    let p = 0;

    for (let period in data.periods) {

        dividedMainPeriods.push(time.createPeriods(data.mainPeriods[p].start, data.granularity.number, data.granularity.key, data.mainPeriods[p].end));

        let aggregationResult = [];

        for (let couple of data.couples) {
            aggregationResult.push([]);
        }

        for (let subperiod of data.periods[period]) {

            const tmp = coupleAggregationCallback(data.dataGroup, data.couples, data.data[`${subperiod.start}${subperiod.end}`], data.dividedPeriods[`${subperiod.start}${subperiod.end}`]);

            aggregatedData.push(tmp.couple);

            for (let i = 0; i < data.couples.length; i++) {
                aggregationResult[i] = aggregationResult[i].concat(tmp.couple[i][0].result);
            }
        }

        for (let i = 0; i < data.couples.length; i++) {
            aggregationResult[i] = mergeTwoTimeSeries(aggregationResult[i], data.backupData[period][i].result);
        }


        dataGroupAggregation.push(dataGroupAggregationCallback(data.dataGroup, aggregationResult, dividedMainPeriods[p]));

    
        p++;
    }



    return { coupleAggregation: aggregatedData, dataGroupAggregation };
}

//
//export new thredWorker. ThreadWorker will be deleted after maxInactiveTime of inacrtivity.
//

module.exports = new ThreadWorker(aggregate, { maxInactiveTime: 60000 });