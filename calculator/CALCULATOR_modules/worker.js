
//
//aggregation functions
//

const { sum, mean, min, max } = require('./aggregationFunction');

//
// For create task
//

const { ThreadWorker } = require('poolifier')

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
 * @param {Object[]}  data.periods - list of periods. Every period is composed by start and end timestamp.
 */

function aggregate(data){
    let externalAggregationCallback;

    switch (data.fname) {
        case 'sum': externalAggregationCallback = sum; break
        case 'mean': externalAggregationCallback = mean; break
        case 'max': externalAggregationCallback = max; break
        case 'min': externalAggregationCallback = min; break
    }

    let aggregatedData = [];

    for (period of data.periods) {
        aggregatedData.push(externalAggregationCallback(data.dataGroup, data.couples, data.data[period.start], data.dividedPeriods[period.start]));
    }

    return aggregatedData;
}

//
//export new thredWorker. ThreadWorker will be deleted after maxInactiveTime of inacrtivity.
//

module.exports = new ThreadWorker(aggregate, {maxInactiveTime: 60000});