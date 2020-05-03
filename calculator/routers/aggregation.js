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
const { time, keyEnumeration } = require('../../custom-modules/time');

//express
const express = require('express');
const router = express.Router();

//aggregation functions
const { sum, mean, min, max } = require('../CALCULATOR_modules/aggregationFunction');

//
// errors class
//

const error = require('../../custom-modules/errors');

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

        let dividedPeriods = {};
        let granIsStandard = false;

        for (period of periods) {
            dividedPeriods[period.start] = [];
            //calculate sub-intervals based on granularity chosen by client
            dividedPeriods[period.start].push(time.createPeriods(period.start, granularity.number, granularity.key, period.end));
            //calculate sub-intervals with standard granularities
            if (roundFactor === 'second'){
                roundFactor = 'minute';
            }
            const standardgranularity = Object.keys(keyEnumeration).filter(value => keyEnumeration[value] >= keyEnumeration[roundFactor]);
            for (let stdgran of standardgranularity) {
                if (granularity.key === stdgran && granularity.number === 1) {
                    granIsStandard = true;
                } else {
                    dividedPeriods[period.start].push(time.createPeriods(time.round(time.add(period.start, 1, stdgran), stdgran), 1, stdgran, time.round(period.end, stdgran)))
                }
            }
        }



        let tags = [];
        let couples = [];
        let dataGroup = [];

        for (let i = 0; i < timeSeries.length; i++) {
            dataGroup[i] = { aggrFun: aggrFunPerGroup[i], couples: [] };
            for (let couple of timeSeries[i]) {
                if (!tags.includes(couple.tag)) {
                    tags.push(couple.tag);
                }
                if (!couples.some(el => el.tag === couple.tag && el.value === couple.value)) {
                    couples.push(couple);
                }
                dataGroup[i].couples.push(couples.findIndex(el => el.tag === couple.tag && el.value === couple.value));
            }
        }

        //TODO let promises = [];

        let data = {};

        for (let period of periods) {
            let response = [];
            try {
                response = await iotData.getData(projectName, tags, [fleet], period.start, period.end, 2);
                if (!response.result) {
                    throw new error.NothingFoundError('nothing found');
                } else {
                    response = response.result;
                    data[period.start] = response;
                }
            } catch (err) {
                if (!(err instanceof error.NothingFoundError)) {
                    throw err;
                }
                data[period.start] = [];
            }
        }

        //TODO
        let externalAggregationCallback;

        switch(aggrFun){
            case 'sum': externalAggregationCallback = sum; break
            case 'mean': externalAggregationCallback = mean; break
            case 'max': externalAggregationCallback = max; break
            case 'min': externalAggregationCallback = min; break
        }
        
        let aggregatedData = [];



        for (period of periods) {
            aggregatedData.push(externalAggregationCallback(dataGroup, couples, data[period.start], dividedPeriods[period.start]));
            //console.log(sum(dataGroup, couples, data[period.start], dividedPeriods[period.start])[1].result);
        }

        let result = [];

        for (let i = 0; i < aggregatedData.length; i++){
            for (let j = 0; j < dataGroup.length; j++){

                let tags = [];
                let values = [];

                for (let couple of dataGroup[j].couples){
                    tags.push(couples[couple].tag);
                    values.push(couples[couple].value);
                }


                result.push({tags, values, timeSeries: aggregatedData[i][j].result[0]});
            }
        }


        return response.status(200).json({ status: 200, result });

    } catch (err) {
        if (!(err instanceof error.TooMuchRetriesError || err instanceof error.ProjectNotExistError)){
            console.error(err);
        }
        if (err instanceof error.TooMuchRetriesError){
            return response.status(401).json({ status: 401, errors: ['problem connecting to ZDM'] });
        }
        return response.status(400).json({ status: 400, errors: ['something went wrong'] });
    }

});


exports.aggregator = router;