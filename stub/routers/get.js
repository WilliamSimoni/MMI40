const MAX_POINT = process.env.MAX_POINT || 400;

const calculator = require(`../stub_modules/calculator`);
const { Database } = require('../../database/db');
const calculatorRules = require('../../calculator configuration/rules');

const moment = require('moment');

//Obtaining instance database
const database = new Database();

//For handling time mutations
const { time, rounder, keyEnumeration, timeConverter } = require(`../../custom-modules/time`);

//For validating request
const { validationResult, body } = require('express-validator');

const express = require('express');
const router = express.Router();

router.post('/', [
    body('projectName')
        .exists().withMessage('Project Name not defined').bail()
        .isString().withMessage('Project Name must be a string').bail()
        .customSanitizer(projectName => projectName.replace(/\s+/g, ''))
        .isLength({ min: 1 }).withMessage('Project Name is not valid').bail()
        .customSanitizer(projectName => projectName.replace(/\w+/g, (match) => match.toLowerCase())),
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
        .optional()
        .isArray({ min: 1 }).withMessage('aggrFunPerGroup is not an array')
        .custom((funGroups, { req }) => {
            for (let fun of funGroups) {
                if (!calculatorRules.legalFunctions.includes(fun))
                    throw new Error('function not yet supported');
            }
            if (Array.isArray(req.body.timeSeries)) {
                if (funGroups.length !== req.body.timeSeries.length) {
                    throw new Error('aggrFunPerGroup length is not the same as timeSeries');
                }
            }
            return true;
        }),
    body('fleet')
        .exists().withMessage('fleet not defined').bail()
        .isString().withMessage('fleet must be a string').bail()
        .customSanitizer(fleet => fleet.replace(/\s+/g, ''))
        .isLength({ min: 1 }).withMessage('fleet is not valid'),
    body('aggregationFunction')
        .exists().withMessage('Aggregation Function name not defined').bail()
        .isString().withMessage('Aggregation Function name is not valid').bail()
        .customSanitizer(aggrFunName => aggrFunName.replace(/\W+/g, ''))
        .custom(aggrFunName => {
            if (!calculatorRules.legalFunctions.includes(aggrFunName)) {
                throw new Error('Aggregation Function is not supported yet');
            }
            return true;
        }),
    body('timeRange')
        .optional()
        .custom(timeRange => {
            if (typeof timeRange.key !== 'string' && typeof timeRange.number !== 'number') {
                throw new Error('Aggregation Function code is not valid');
            }
            if (timeRange.number <= 0) {
                throw new Error('timeRange number must be > 0');
            }
            return true;
        }).bail()
        .customSanitizer(timeRange => {
            timeRange.key = timeRange.key.replace(/\W+/g, '');
            return timeRange;
        })
        .custom((timeRange) => {
            if (!(/\b(second|minute|hour|day|week|month|year)\b/g.test(timeRange.key))) {
                throw new Error('timeRange key is not valid');
            }
            return true;
        }),
    body('start')
        .if(body('timeRange').exists())
        .optional()
        .isInt({ min: 0 }).withMessage('start must be a integer number which represent timestamp')
        .if(body('unit').exists())
        .customSanitizer((start, { req }) => {
            switch (req.body.unit) {
                case 'n': return Math.floor(start / 1000000000);
                case 'm': return Math.floor(start / 1000000);
                case 'M': return Math.floor(start / 1000);
                case 's': return start;
                default: return start;
            }
        }),
    body('start')
        .if(body('timeRange').not().exists())
        .exists().withMessage('if you do not send timeRange you must send start').bail()
        .isInt({ min: 0 }).withMessage('start must be a integer number')
        .customSanitizer((start, { req }) => {
            switch (req.body.unit) {
                case 'n': return Math.floor(start / 1000000000);
                case 'm': return Math.floor(start / 1000000);
                case 'M': return Math.floor(start / 1000);
                case 's': return start;
                default: return start;
            }
        }),
    body('end')
        .optional()
        .exists(body('start')).withMessage('end can be sent only with start defined').bail()
        .custom((end, { req }) => {
            if (typeof end === 'number') {
                if (end <= req.body.start) {
                    throw new Error('end must be a number > start');
                }
            } else {
                throw new Error('end must be a number > start');
            }
            return true;
        })
        .customSanitizer((end, { req }) => {
            switch (req.body.unit) {
                case 'n': return Math.floor(end / 1000000000);
                case 'm': return Math.floor(end / 1000000);
                case 'M': return Math.floor(end / 1000);
                case 's': return end;
                default: return end;
            }
        }),
    body('unit')
        .if(body('start').exists())
        .isString().withMessage('unit must be a string').bail()
        .matches(/(n|m|M|s)/).withMessage('unit sent is not valid'),
    body('granularity')
        .exists().withMessage('granularity not defined').bail()
        .custom(granularity => {
            if (typeof granularity.key !== 'string' && typeof granularity.number !== 'number') {
                throw new Error('granularity is not valid');
            }
            if (granularity.number <= 0) {
                throw new Error('granularity number must be > 0');
            }
            return true;
        }).bail()
        .customSanitizer(granularity => {
            granularity.key = granularity.key.replace(/\W+/g, '');
            return granularity;
        })
        .custom((granularity) => {
            if (!(/\b(second|minute|hour|day|week|month|year)\b/g.test(granularity.key))) {
                throw new Error('granularity key is not valid');
            }
            return true;
        }),
    body('store')
        .exists().withMessage('store is not defined').bail()
        .isBoolean().withMessage('store must be boolean true or false')
        .if(body('timeRange').not().exists())
        .customSanitizer(store => {
            return false;
        })
], async (request, response) => {
    try {
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

        const body = request.body;
        let project = body.projectName;
        let timeSeries = body.timeSeries;
        let fleet = body.fleet;
        let timeRange = body.timeRange;
        let start = body.start;
        let end = body.end;
        let unit = body.unit;
        let aggrFun = body.aggregationFunction;
        let granularity = body.granularity;
        let store = body.store;
        let aggrFunPerGroup = body.aggrFunPerGroup;

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


        //if start is defined then timeSeriesStart is increased to the closest moment to rounded start
        if (start && timeRange) {
            start = time.round(start, granularityRoundFactor);
            timeSeriesStart = time.nearestMoment(timeSeriesStart, granularity.number, granularity.key, start);
        }

        let timeSeriesRoundFactor = rounder.roundPerGranularity(timeConverter.convertSecond(granularity.number, granularity.key));
        timeSeriesStart = time.nearestMoment(time.round(timeSeriesStart, timeSeriesRoundFactor), granularity.number, granularity.key, timeSeriesStart);

        //defining end
        if (!end) {
            end = time.nearestMoment(time.round(now, timeSeriesRoundFactor), granularity.number, granularity.key, now);
        } else {
            end = time.nearestMoment(time.round(end, timeSeriesRoundFactor), granularity.number, granularity.key, end);
        }

        //is aggrFunPerGroup is not sent then the internal aggregation is set equal to aggrFun
        if (!aggrFunPerGroup){
            aggrFunPerGroup = [];
            for (let item of timeSeries){
                aggrFunPerGroup.push(aggrFun);
            }
        }

        periods = [{ start: timeSeriesStart, end: end }];

        let result = await calculator.aggrFun(aggrFun, project, timeSeries, fleet, aggrFunPerGroup, periods, granularity, minGranularity);

        //
        //calculator error handling
        //

        if (result.status !== 200){
            return response.status(421).json({ status: 421, errors: [result.error]});
        }

        //
        // calculating next Request time range
        //

        const nextRequestTime = time.add(end, granularity.number, granularity.key) - now;

        response.status(200).json({ status: 200, timeSeriesStart, granularity, start: moment.unix(timeSeriesStart).toISOString(), end: moment.unix(end).toISOString(), nextRequestTime, result: result.result });

    } catch (err) {
        console.error(err);
        response.status(400).json({ status: 400, errors: ['Something went wrong'] });
    }
}
);

exports.get = router;
