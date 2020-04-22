const MAX_POINT = process.env.MAX_POINT || 400;

const sorting = require(`../FIBO_modules/sorting`);
const calculator = require(`../FIBO_modules/calculator`);
const { SanitizerError } = require(`../Error_Class/SanitizerError`);
const { Database } = require('../database/db');

//Obtaining instance database
const database = new Database();

//For handling time mutations
const { time, rounder, keyEnumeration } = require(`../FIBO_modules/time`);

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
    body('tags')
        .exists().withMessage('tags not defined').bail()
        .isArray({ min: 1 }).withMessage('tags is not valid').bail()
        .custom(tags => {
            for (let tag of tags) {
                if (!Array.isArray(tag))
                    throw new Error('tag is not valid');
                if (tag.length === 0) {
                    throw new Error('an array in tags is empty')
                }
                for (let item of tag) {
                    item = item.replace(/\s+/g, '');
                    if (item.length === 0) {
                        throw new Error('an item in tags is empty')
                    }
                }
            }
            return true;
        }),
    body('fleet')
        .exists().withMessage('fleet not defined').bail()
        .isString().withMessage('fleet must be a string').bail()
        .customSanitizer(fleet => fleet.replace(/\s+/g, ''))
        .isLength({ min: 1 }).withMessage('fleet is not valid'),
    body('values')
        .exists().withMessage('values not defined').bail()
        .isArray({ min: 1 }).withMessage('values is not valid').bail()
        .custom(values => {
            for (let value of values) {
                value = value.replace(/\s+/g, '');
                if (value.length === 0) {
                    throw new Error('an item in values is empty')
                }
            }
            return true;
        }),
    body('aggregationFunction')
        .exists().withMessage('Aggregation Function name not defined').bail()
        .isString().withMessage('Aggregation Function name is not valid').bail()
        .customSanitizer(aggrFunName => aggrFunName.replace(/\W+/g, ''))
        .custom(aggrFunName => {
            if (!calculator.legalFunctions.includes(aggrFunName)) {
                throw new Error('Aggregation Function is not supported yet');
            }
            return true;
        }),
    body('timePeriod')
        .optional()
        .custom(timePeriod => {
            if (typeof timePeriod.key !== 'string' && typeof timePeriod.number !== 'number') {
                throw new Error('Aggregation Function code is not valid');
            }
            if (timePeriod.number <= 0) {
                throw new Error('timePeriod number must be > 0');
            }
            return true;
        }).bail()
        .customSanitizer(timePeriod => {
            timePeriod.key = timePeriod.key.replace(/\W+/g, '');
            return timePeriod;
        })
        .custom((timePeriod) => {
            if (!(/\b(second|minute|hour|day|week|month|year)\b/g.test(timePeriod.key))) {
                throw new Error('timePeriod key is not valid');
            }
            return true;
        }),
    body('start')
        .if(body('timePeriod').exists())
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
        .if(body('timePeriod').not().exists())
        .exists().withMessage('if you do not send time Period you must send start').bail()
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
        .if(body('timePeriod').not().exists())
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
        let tags = body.tags;
        let fleet = body.fleet;
        let values = body.values;
        let timePeriod = body.timePeriod;
        let start = body.start;
        let end = body.end;
        let unit = body.unit;
        let aggrFun = body.aggregationFunction;
        let granularity = body.granularity;
        let store = body.store;

        const now = time.now();

        //timeSeriesStart is the beginning of the time series that will be sent to the Client.
        let timeSeriesStart;

        //defining timeSeriesStart
        if (timePeriod){
            timeSeriesStart = time.subtract(now,timePeriod.number, timePeriod.key);
        } else {
            timeSeriesStart = start;
        }

        //rounding timeSeriesStart at the beginning of the minute, hour, ... according to the value returned by rounder.roundPerTimePeriod
        const minGranularity= rounder.roundPerTimePeriod(now,timeSeriesStart);

        let roundFactor;
        if (keyEnumeration[minGranularity] < keyEnumeration[granularity.key]){
            roundFactor = granularity.key;
        } else {
            roundFactor = minGranularity;
        }

        timeSeriesStart = time.round(timeSeriesStart,roundFactor);
        //rounding granularity by roundFactor
        granularity = rounder.roundGranularity(granularity.number, granularity.key, roundFactor);

        //if start is defined then timeSeriesStart is increased to start
        if (start && timePeriod){
            timeSeriesStart = time.nearestMoment(timeSeriesStart, granularity.number, granularity.key, start);
        }

        //defining end
        if (!end){
            end = time.round(now, roundFactor);
        } else {
            end = time.round(end, roundFactor);
        }

        //aggregating data 
        periods = [{start: timeSeriesStart, end: end}];
        granularities = [{number:granularity.number, key: granularity.key}];

        let result = await calculator.aggrFun(aggrFun,project,tags,values,[fleet],periods,granularities);

        response.status(200).json({ status: 200, timeSeriesStart, granularity, result: result.result });

    } catch (err) {
        console.error(err);
        response.status(400).json({ status: 400, errors: ['Something went wrong'] });
    }
}
);

exports.get = router;
