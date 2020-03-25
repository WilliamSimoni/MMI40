
const sorting = require('../FIBO_modules/sorting');
const calculator = require('../FIBO_modules/calculator')
const {SanitizerError} = require('../Error_Class/SanitizerError');
const database = require('../FIBO_modules/database')

const moment = require('moment');

const express = require('express');
const { validationResult, body, check } = require('express-validator');
const app = express();

//setting environment variables with dotenv
require('dotenv').config();
const PORT = process.env.PORT || 7777;
//functions to handle errors


function errorJSONParser(err, request, response, next) {
    if (err instanceof SyntaxError && err.status === 400) {
        response.status(400).json({ status: 400, errors: [{ error: 'body must be in json' }] });
        return;
    }
    next(err);
}

function SanitizerErr(err, request, response, next) {
    if (err instanceof SanitizerError && err.status === 400) {
        response.status(400).json({ status: 400, errors: [{ error: err.message }] });
        return;
    }
    next(err);
}

function genericError(err, request, response, next) {
    console.error(err.stack);
    response.status(400).json({ status: 400, errors: [{ error: 'Something went wrong' }] });
    return;
}

//add middleware which parse in json the body of the post request.
//limit means that the maximum body dimension in a post request is 1 megabyte
app.use(express.json({ limit: '1mb' }));

app.post('/get', [
    body('projectName')
        .exists().withMessage('Bad Request').bail()
        .isString().withMessage('Project Name is not valid').bail()
        .customSanitizer(projectName => projectName.replace(/\W+/g, ''))
        .isLength({ min: 1 }).withMessage('Project Name is not valid').bail()
        .customSanitizer(projectName => projectName.replace(/\w+/g, (match) => match.toLowerCase())),
    body('device')
        .exists().withMessage('Bad Request').bail()
        .isArray({ min: 1 }).withMessage('device is not valid').bail()
        .customSanitizer(device => {
            for (let i = 0; i < device.length; i++) {
                if (typeof device[i] !== 'string') {
                    throw new SanitizerError('device elements must be not empty string');
                }
                device[i] = device[i].trim();
                if (device[i].length === 0) {
                    throw new SanitizerError('device elements must be not empty string');
                }
            }
            return device;
        }),
    body('keyword')
        .exists().withMessage('Bad Request').bail()
        .isArray({ min: 1 }).withMessage('keyword is not valid').bail()
        .customSanitizer(keyword => {
            for (let i = 0; i < keyword.length; i++) {
                if (typeof keyword[i] !== 'string') {
                    throw new SanitizerError('keyword elements must be not empty string');
                }
                keyword[i] = keyword[i].trim();
                if (keyword[i].length === 0) {
                    throw new SanitizerError('keyword elements must be not empty string');
                }
            }
            return keyword;
        }),
    body('aggregationFunction.name')
        .exists().withMessage('Bad Request').bail()
        .isString().withMessage('Aggregation Function name is not valid').bail()
        .customSanitizer(aggrFunName => aggrFunName.replace(/\W+/g, ''))
        .custom(aggrFunName => {
            if (!calculator.legalFunctions.includes(aggrFunName)) {
                throw new Error('Aggregation Function name is not supported yet');
            }
            return true;
        }),
    body('aggregationFunction.code')
        .exists().withMessage('Bad Request').bail()
        .isInt().withMessage('Aggregation Function code is not valid').bail()
        .custom(code => {
            if (!calculator.legalCodes(code)) {
                throw new Error('Aggregation Function code is not valid');
            }
            return true;
        }),
    body('timePeriod')
        .exists().withMessage('Bad Request').bail()
        .customSanitizer((timePeriod, { req }) => {
            //case client sent timeperiod defined as {key: , number: }
            if (typeof timePeriod.key === 'string' && typeof timePeriod.number === 'number') {
                //timeperiod.number must be > 0
                if (timePeriod.number <= 0) {
                    throw new SanitizerError('timePeriod number must be > 0');
                }
                timePeriod.key = timePeriod.key.replace(/\W+/g, '');
                if (!(/\b(second|minute|hour|day|week|month|year)\b/g.test(timePeriod.key))) {
                    throw new SanitizerError('timePeriod key is not valid');
                }
                req.body.timePeriodType1 = true;
                return timePeriod;
            }

            if (typeof timePeriod.start === 'number' && typeof timePeriod.end === 'number' && typeof timePeriod.unit === 'string') {
                req.body.timePeriodType1 = false;
                timePeriod.unit = timePeriod.unit.replace(/\W+/g, '');
                if (!(/\b(n|m|s)\b/g).test(timePeriod.unit)) {
                    throw new SanitizerError('Wrong time period unit');
                }
                return timePeriod;
            }

            throw new SanitizerError('Time Period is not valid');
        }),
    body('granularity')
        .exists().withMessage('Bad Request').bail()
        .customSanitizer((granularity, { req }) => {
            if (typeof granularity === 'number') {
                if (granularity <= 0) {
                    throw new SanitizerError('granularity must be > 0');
                }
            } else if (typeof granularity === 'string' && req.body.timePeriodType1 === true) {
                granularity = granularity.replace(/\W+/g, '');
                if (!(/\b(minute|hour|day|week|month|year)\b/g).test(granularity)) {
                    throw new SanitizerError('granularity key is not correct');
                }

                //checking granularity content
                switch (granularity) {
                    case 'minute':
                        if (/\b(second|day|week|month|year)\b/g.test(req.body.timePeriod.key)) {
                            throw new SanitizerError('granularity key is not supported for this period of time');
                        }
                        break;
                    case 'hour':
                        if (/\b(second|minute|month|year)\b/g.test(req.body.timePeriod.key)) {
                            throw new SanitizerError('granularity key is not supported for this period of time');
                        }
                        break;
                    case 'week':
                        if (/\b(second|minute|hour|day)\b/g.test(req.body.timePeriod.key)) {
                            throw new SanitizerError('granularity key is not supported for this period of time');
                        }
                        break;
                    case 'month':
                        if (/\b(second|minute|hour|day|week)\b/g.test(req.body.timePeriod.key)) {
                            throw new SanitizerError('granularity key is not supported for this period of time');
                        }
                        break;
                    case 'year':
                        if (/\b(second|minute|hour|day|week|month)\b/g.test(req.body.timePeriod.key)) {
                            throw new SanitizerError('granularity key is not supported for this period of time');
                        }
                        break;
                }
            } else {
                throw new SanitizerError('granularity must be a key or a number'); //TOWRITEBETTER
            }
            return granularity;
        }),
    body('store')
        .exists().withMessage('Bad Request').bail()
        .isBoolean().withMessage('store must be boolean true or false').bail()
], async (request, response) => {
    try {
        //handle validation error inside custom function
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            const errArray = errors.array();
            let errResponse = [];
            for (err of errArray) {
                errResponse.push({ error: err.msg });
            }
            return response.status(400).json({ status: 400, errors: errResponse });
        }

        const body = request.body;
        let devices = body.device;
        let keywords = body.keyword;
        let timePeriod = body.timePeriod;
        let aggrFun = body.aggregationFunction;
        let granularity = body.granularity;
        let store = body.store;

        const start = Math.floor(moment().subtract(timePeriod.number, timePeriod.key).unix() * 1000000000);

        //array where to save the query result 
        let queryResult = [];

        //handle case divided: [device,keyword] aggregated: [] and divided: [keyword,device] aggregated: []
        if (aggrFun.code <= 1) {
            //query database only if store=true and Time Period is defined as {key: , number: }
            if (store === true && body.timePeriodType1 === true) {
                let promises = [];
                for (device of devices) {
                    for (keyword of keywords) {
                        const promise = database.query(start, device, keyword,
                            aggrFun.name, aggrFun.code.toString(), body.timePeriod.key,
                            timePeriod.number.toString(), granularity.toString());
                        //push query in promises array
                        promises.push(promise);
                    }
                }
                //await for all query result
                await Promise.all(promises)
                    .then((response) => {
                        let i = 0;
                        for (device of devices) {
                            for (keyword of keywords) {
                                queryResult.push({ device: device, keyword: keyword, result: response[i] });
                                i++;
                            }
                        }
                    })
                    .catch(reason => {
                        console.error(reason);
                    });

                response.status(200).json({ status: 200, result: queryResult });
                
                return;
            }
        }

        response.status(200).json({ status: 200, request: request.body });

    } catch (err) {
        console.error(err);
        response.status(400).json({ status: 400, errors: [{ error: 'Something went wrong' }] });
    }
}
);

app.use(errorJSONParser);
app.use(SanitizerErr);
app.use(genericError);

exports.app = app;