const rules = require('../../calculator configuration/rules');

//
//Get data from ZDM
//

const { IoTData } = require('../../custom-modules/getIotData');

const iotData = new IoTData();

//
//For validating request
//

const { validationResult, body } = require('express-validator');
const { time, keyEnumeration, getEnumerationKey } = require('../../custom-modules/time');

//express
const express = require('express');
const router = express.Router();

//
// errors class
//

const error = require('../../custom-modules/errors');

//
//Thread Pool for aggregation
//

const { DynamicThreadPool } = require('poolifier');

const pool = new DynamicThreadPool(2, 10,
    __dirname + '/../CALCULATOR_modules/worker.js',
    {
        errorHandler: (e) => console.error(e)
    }
);

//
// Database InfluxDb
//

const { Database } = require('../../database/db');
const database = new Database();

//
//getting different database clients
//

const databaseClients = database.getAllTimeSeriesClients();

const clientCounters = [0, 0, 0, 0];

function addClientQueue(clientIndex, result, invalid, projectName, fleet, tag, value, aggrFun, granularityKey) {

    for (let payload of result) {
        database.queueStandardData(databaseClients[clientIndex], projectName, granularityKey, fleet, tag, value, payload.value, true, aggrFun, payload.time);
        clientCounters[clientIndex]++;
    }

    if (result.length > 0) {
        for (let payload of invalid) {
            database.queueStandardData(databaseClients[clientIndex], projectName, granularityKey, fleet, tag, value, null, false, aggrFun, payload.time);
            clientCounters[clientIndex]++;
        }
    }

}

router.post('/', [
    body('aggrFun')
        .isString().bail()
        .isLength({ min: 1 }).bail()
        .custom(name => {
            if (!rules.legalFunctions.includes(name)) {
                return false;
            } else {
                return true;
            }
        }),
    body('projectName')
        .isString().bail()
        .isLength({ min: 1 }),
    body('timeSeries')
        .exists().withMessage('timeSeries not defined').bail()
        .isArray({ min: 1 }).withMessage('timeSeries is not valid').bail()
        .custom(timeSeries => {
            for (let item of timeSeries) {
                if (!Array.isArray(item)) {
                    throw new Error('an item in timeSeries is not an array');
                }
                if (item.length === 0) {
                    throw new Error('an item in timeSeries is an empty array');
                }
                for (let couple of item) {
                    if (!couple.value || !couple.tag) {
                        throw new Error('an item in timeSeries contains invalid couple (tag,value)');
                    }
                    if (typeof couple.value !== 'string' || typeof couple.tag !== 'string') {
                        throw new Error('an item in timeSeries contains invalid couple (tag,value)');
                    }
                }
            }
            return true;
        }),
    body('aggrFunPerGroup')
        .exists().withMessage('aggrFunPerGroup not defined')
        .isArray({ min: 1 }).withMessage('aggrFunPerGroup is not an array')
        .custom((funGroups, { req }) => {
            for (let fun of funGroups) {
                if (!rules.legalFunctions.includes(fun))
                    throw new Error('function not yet supported');
            }
            if (Array.isArray(req.body.timeSeries)) {
                if (funGroups.length !== req.body.timeSeries.length) {
                    throw new Error('aggrFunPerGroup length is not the same as timeSeries');
                }
            }
            return true;
        }),
    body('roundFactor')
        .isString(),
    body('fleet')
        .isString(),
    body('periods')
        .isArray({ min: 1 }).bail()
        .custom(periods => {
            for (let period of periods) {
                if (!period.start || !period.end) {
                    return false;
                }
            }
            return true;
        }).withMessage('period not valid'),
    body('granularity')
        .custom(granularity => {
            if (!granularity.key || !granularity.number) {
                return false;
            }
            return true;
        }).withMessage('granularity is no valid')
], async (request, response) => {

    //handle validation error
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        const errArray = errors.array();
        let errResponse = [];
        for (err of errArray) {
            errResponse.push(err.msg);
        }
        return response.status(400).json({ status: 400, errors: errResponse });
    }

    try {

        let {
            aggrFun,
            projectName,
            timeSeries,
            aggrFunPerGroup,
            fleet,
            periods,
            granularity,
            roundFactor
        } = request.body;

        //divide periods in subPeriods according to granularities
        /*dividedPeriod is structured as follow: 
            dividePeriod: {
                period.start: [[

                ]]
            }
        */

        //
        //making support data structures
        //

        //
        // array of object {tag: value: }. It represent the set of couples (tag, value) which are contained in the Time Series Object sent by Client.
        //

        let couples = [];

        //
        // array of Object, i-th element has property aggrFun relative to i-th aggregation in aggrFunPerGrouo
        // and has property couple relative to i-th array in Time Series Object. Each element in couple is a numeric index.
        //

        let dataGroup = [];

        for (let i = 0; i < timeSeries.length; i++) {

            dataGroup[i] = { aggrFun: aggrFunPerGroup[i], couples: [] };

            for (let couple of timeSeries[i]) {

                if (!couples.some(el => el.tag === couple.tag && el.value === couple.value)) {
                    couples.push(couple);
                }

                dataGroup[i].couples.push(couples.findIndex(el => el.tag === couple.tag && el.value === couple.value));

            }
        }

        //
        // read from database
        //


        if (roundFactor === 'second' && keyEnumeration[granularity.key] > 0) {
            roundFactor = 'minute';
        }

        let roundFactorEnumarationValue = keyEnumeration[roundFactor];

        let databaseDataCouple = {};

        let subPeriods = {};

        if (granularity.key !== 'second') {

            for (let period of periods) {

                databaseDataCouple[period.start] = [];

                subPeriods[period.start] = [];

                //
                // contains all the data sent by database
                //

                let databaseData = [];

                //
                // used in the next section to remember the index to which we arrived
                //

                let counter = [];

                let tmpNoDataStart = [];

                //
                // read exixsting data from database
                //

                for (let couple of couples) {
                    const result = await database.queryStandardData(
                        databaseClients[(roundFactorEnumarationValue > 3) ? 4 : (roundFactorEnumarationValue)],
                        projectName, fleet, couple.tag, couple.value, aggrFun, roundFactor, period.start * 1000000000, period.end * 1000000000
                    );

                    //
                    // if it finds something then result.length > 0
                    //

                    if (result.length === 0) {
                        const subPeriodItem = subPeriods[period.start].find(el => el.start === period.start && el.end === period.end);

                        if (subPeriodItem) {

                            if (!subPeriodItem.couples.some(el => el.tag === couple.tag && el.value === couple.value)) {
                                subPeriodItem.couples.push(couple);
                            }

                        } else {

                            subPeriods[period.start].push({ couples: [couple], start: period.start, end: period.end })

                        }

                    }

                    databaseData.push(result);

                    counter.push(result.length - 1);

                    tmpNoDataStart.push(0);

                    databaseDataCouple[period.start].push({ result: [], invalid: [] });

                }

                let moment = period.start;
                const end = period.end;

                while (moment < end) {

                    for (let i = 0; i < databaseData.length; i++) {

                        if (databaseData[i].length === 0) {
                            continue;
                        }

                        const item = databaseData[i];

                        if (moment < item[counter[i]].time) {

                            if (tmpNoDataStart[i] === 0) {
                                //console.log('min', moment, item[counter[i]].time);
                                tmpNoDataStart[i] = moment;
                            }

                        } else
                            if (moment > item[counter[i]].time) {
                                //console.log('minchione', moment, item[counter[i]].time);
                                if (tmpNoDataStart[i] === 0) {
                                    tmpNoDataStart[i] = moment;
                                }
                            }
                            else {

                                if (item[counter[i]].isValid) {
                                    databaseDataCouple[period.start][i].result.unshift({ time: item[counter[i]].time, value: item[counter[i]].value });
                                } else {
                                    databaseDataCouple[period.start][i].invalid.unshift({ time: item[counter[i]].time, value: item[counter[i]].value });
                                }

                                //console.log('minchia', moment, item[counter[i]].time, tmpNoDataStart[i]);

                                if (tmpNoDataStart[i] !== 0) {

                                    const subPeriodItem = subPeriods[period.start].find(el => el.start === tmpNoDataStart[i] && el.end === moment - 1);

                                    if (subPeriodItem) {

                                        if (!subPeriodItem.couples.some(el => el.tag === couples[i].tag && el.value === couples[i].value)) {
                                            subPeriodItem.couples.push(couples[i]);
                                        }

                                    } else {
                                        subPeriods[period.start].push({ couples: [couples[i]], start: tmpNoDataStart[i], end: moment - 1 })
                                    }

                                    tmpNoDataStart[i] = 0;

                                }

                                if (counter[i] > 0) {
                                    counter[i]--;
                                }

                            }

                    }

                    moment = time.add(moment, 1, roundFactor)
                }

                //
                // controll data last period
                //

                for (let i = 0; i < databaseData.length; i++) {

                    if (tmpNoDataStart[i] !== 0) {

                        const subPeriodItem = subPeriods[period.start].find(el => el.start === tmpNoDataStart[i] && el.end === moment - 1);

                        if (subPeriodItem) {

                            if (!subPeriodItem.couples.some(el => el.tag === couples[i].tag && el.value === couples[i].value)) {
                                subPeriodItem.couples.push(couples[i]);
                            }

                        } else {
                            subPeriods[period.start].push({ couples: [couples[i]], start: tmpNoDataStart[i], end: end })
                        }

                    }

                }

            }

        }
        console.log(subPeriods);
        //console.log(databaseDataCouple);

        let dividedPeriods = {};

        let granIsStandard = false;

        let data = {};

        dividedMainPeriods = [];

        let p = 0;

        for (let period in subPeriods) {

            dividedMainPeriods.push(time.createPeriods(periods[p].start, granularity.number, granularity.key, periods[p].end));

            p++;

            for (let subperiod of subPeriods[period]) {

                //console.log('caio',subperiod.start);

                dividedPeriods[`${subperiod.start}${subperiod.end}`] = [];

                //
                //calculate sub-intervals based on granularity chosen by client
                //

                dividedPeriods[`${subperiod.start}${subperiod.end}`].push(time.createPeriods(subperiod.start, granularity.number, granularity.key, subperiod.end));

                //
                //calculate sub-intervals with standard granularities
                //

                const standardgranularity = Object.keys(keyEnumeration).filter(value => keyEnumeration[value] >= roundFactorEnumarationValue && keyEnumeration[value] <= keyEnumeration[granularity.key]);

                for (let stdgran of standardgranularity) {
                    if (granularity.key === stdgran && granularity.number === 1) {

                        granIsStandard = true;

                    } else {

                        dividedPeriods[`${subperiod.start}${subperiod.end}`].push(time.createPeriods(subperiod.start, 1, stdgran, subperiod.end));

                    }
                }

                //
                // fetching data from ZDM (TODO WITH PROMISE.ALL)
                //

                try {

                    const queryTags = ((couples) => {
                        let result = [];
                        for (let couple of couples){
                            if (!result.includes(couple.tag)){
                                result.push(couple.tag);
                            }
                        }
                        return result;
                    })(subperiod.couples);

                    console.log(queryTags);

                    let response = await iotData.getData(projectName, queryTags, [fleet], subperiod.start, subperiod.end, 2);
                    //console.log(response);
                    if (!response.result) {
                        throw new error.NothingFoundError('nothing found');
                    } else {
                        response = response.result;
                        data[`${subperiod.start}${subperiod.end}`] = response;
                    }
                } catch (err) {
                    if (!(err instanceof error.NothingFoundError)) {
                        throw err;
                    }
                    data[`${subperiod.start}${subperiod.end}`] = [];
                }

            }
        }

        //console.log(data);

        //const start = Date.now();
        const aggregatedData = await pool.execute({
            fname: aggrFun,
            dataGroup: dataGroup,
            couples: couples,
            data: data,
            dividedPeriods: dividedPeriods,
            periods: subPeriods,
            dividedMainPeriods: dividedMainPeriods,
            backupData: databaseDataCouple
        })
        //console.log(Date.now() - start)

        //console.log(aggregatedData.dataGroupAggregation);

        let result = [];

        for (let j = 0; j < dataGroup.length; j++) {

            result.push([]);

            //
            // selecting tags and value for the data group
            //

            let tags = [];
            let values = [];

            for (let couple of dataGroup[j].couples) {
                tags.push(couples[couple].tag);
                values.push(couples[couple].value);
            }

            //
            // merging different periods in one time Series
            //

            for (let i = 0; i < periods.length; i++) {
                result[j].push({ tags, values, result: aggregatedData.dataGroupAggregation[i][j].result, invalid: aggregatedData.dataGroupAggregation[i][j].invalid});
            }
        }

        response.status(200).json({ status: 200, result });

        //
        // writing standard results on db
        //

        const keyEnumerationGranularityKey = keyEnumeration[granularity.key];

        let standatdClientIndex = (keyEnumerationGranularityKey > 3) ? 4 : (keyEnumerationGranularityKey);

        try {
            for (let period in subPeriods) {

                for (let i = 0; i < subPeriods[period].length; i++) {
                    
                    for (let t = 0; t < couples.length; t++) {

                        const item = aggregatedData.coupleAggregation[i][t];
                        const couple = couples[t];

                        let keyEnNumber = roundFactorEnumarationValue;

                        if (granIsStandard) {
                            addClientQueue(standatdClientIndex, item[0].result, item[0].invalid, projectName, fleet, couple.tag, couple.value, aggrFun, granularity.key);

                            for (let j = 1; j < item.length; j++) {

                                let granularityKeyIndex = keyEnNumber + j - 1;

                                const data = item[j];

                                if (granularityKeyIndex === keyEnumerationGranularityKey) {
                                    granularityKeyIndex++;
                                    keyEnNumber++;
                                }

                                const clientIndex = (granularityKeyIndex > 3) ? 4 : granularityKeyIndex;

                                addClientQueue(clientIndex, data.result, data.invalid, projectName, fleet, couple.tag, couple.value, aggrFun, getEnumerationKey(granularityKeyIndex));

                            }
                        } else {

                            for (let j = 1; j < item.length; j++) {

                                const granularityKeyIndex = keyEnNumber + j - 1;

                                const data = item[j];

                                const clientIndex = (granularityKeyIndex > 3) ? 4 : granularityKeyIndex;

                                addClientQueue(clientIndex, data.result, data.invalid, projectName, fleet, couple.tag, couple.value, aggrFun, getEnumerationKey(granularityKeyIndex));

                            }

                        }
                    }
                }
            }

            for (let i = 0; i < databaseClients.length; i++) {
                if (clientCounters[i] > 0) {
                    await database.writeData(databaseClients[i]);
                    clientCounters[i] = 0;
                }
            }

        } catch (err) {
            console.error(err);
            console.error('err', request.body);
        }


    } catch (err) {
        if (!(err instanceof error.TooMuchRetriesError || err instanceof error.ProjectNotExistError || err instanceof error.FleetNotExistError)) {
            console.error(err);
        }

        if (err instanceof error.TooMuchRetriesError) {
            return response.status(401).json({ status: 401, error: err.message });
        }

        if (err instanceof error.FleetNotExistError) {
            return response.status(402).json({ status: 402, error: err.message });
        }

        return response.status(400).json({ status: 400, error: 'something went wrong' });
    }

});


exports.aggregator = router;