const sorting = require('./FIBO_modules/sorting');
const calculator = require('./FIBO_modules/calculator')
const { SanitizerError } = require('./Error_Class/SanitizerError');
const database = require('./FIBO_modules/database')

const moment = require('moment');

const express = require('express');
const { validationResult, body, check } = require('express-validator');
const app = express();

//setting environment variables with dotenv
require('dotenv').config();
const PORT = process.env.PORT || 7777;

const server = app.listen(PORT, () => { console.log(`listening on ${PORT}`) });

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
        .exists().withMessage('Project Name not defined').bail()
        .isString().withMessage('Project Name must be a string').bail()
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
        .exists().withMessage('Aggregation Function name not defined').bail()
        .isString().withMessage('Aggregation Function name is not valid').bail()
        .customSanitizer(aggrFunName => aggrFunName.replace(/\W+/g, ''))
        .custom(aggrFunName => {
            if (!calculator.legalFunctions.includes(aggrFunName)) {
                throw new Error('Aggregation Function name is not supported yet');
            }
            return true;
        }),
    body('aggregationFunction.code')
        .exists().withMessage('Aggregation Function code not defined').bail()
        .isInt().withMessage('Aggregation Function code is not valid').bail()
        .custom(code => {
            if (!calculator.legalCodes(code)) {
                throw new Error('Aggregation Function code is not valid');
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
        .isInt({ min: 0 }).withMessage('start must be a integer number which represent timestamp'),
    body('start')
        .if(body('timePeriod').not().exists())
        .exists().withMessage('if you do not send time Period you must send start').bail()
        .isInt({ min: 0 }).withMessage('start must be a integer number'),
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
        }),
    body('unit')
        .if(body('start').exists())
        .isString().withMessage('unit must be a string').bail()
        .matches(/(n|m|M|s)/).withMessage('unit sent is not valid'),
    body('start')
        .if(body('start').exists)
        .if(body('unit').exists())
        .customSanitizer((start, { req }) => {
            switch (req.body.unit) {
                case 'n': return start;
                case 'm': return start * 1000;
                case 'M': return start * 1000000;
                case 's': return start * 1000000000;
            }
        }),
    body('granularity')
        .exists().withMessage('granularity not defined').bail()
        .if(body('granularity').isInt())
        .isInt({ min: 1 }).withMessage('granularity must be an integer > 0 or a string if TimePeriod is defined'),
    /*body('granularity')
        .if(body('granularity').exists())
        .if(body('granularity').isString())
        .custom((granularity, { req }) => {
            if (!req.body.timePeriod) {
                throw new Error('granularity as string can be sent only if TimePeriod is defined');
            }
            return true;
        }).bail()
        .customSanitizer(granularity => granularity.replace(/\W+/g, ''))
        .custom(granularity => {
            if (!(/\b(minute|hour|day|week|month|year)\b/g).test(granularity)) {
                throw new Error('granularity key is not correct');
            }
            return true;
        }).bail()
        .custom((granularity, {req}) => {
            //checking granularity content
            switch (granularity) {
                case 'minute':
                    if (/\b(second|day|week|month|year)\b/g.test(req.body.timePeriod.key)) {
                        throw new Error('granularity key is not supported for this period of time');
                    }
                    break;
                case 'hour':
                    if (/\b(second|minute|month|year)\b/g.test(req.body.timePeriod.key)) {
                        throw new Error('granularity key is not supported for this period of time');
                    }
                    break;
                case 'week':
                    if (/\b(second|minute|hour|day)\b/g.test(req.body.timePeriod.key)) {
                        throw new Error('granularity key is not supported for this period of time');
                    }
                    break;
                case 'month':
                    if (/\b(second|minute|hour|day|week)\b/g.test(req.body.timePeriod.key)) {
                        throw new Error('granularity key is not supported for this period of time');
                    }
                    break;
                case 'year':
                    if (/\b(second|minute|hour|day|week|month)\b/g.test(req.body.timePeriod.key)) {
                        throw new Error('granularity key is not supported for this period of time');
                    }
                    break;
            }
        }),*/
    body('store')
        .exists().withMessage('store is not defined').bail()
        .isBoolean().withMessage('store must be boolean true or false'),
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
        let start = body.start;
        let end = body.end;
        let unit = body.unit;
        let aggrFun = body.aggregationFunction;
        let granularity = body.granularity;
        let store = body.store;

        //if start is not defined, the start moment is defined by timePeriod 
        if (!start) {
            start = moment().subtract(timePeriod.number, timePeriod.key).unix() * 1000000000;
        } else {
            //if end is not defined, the end moment is the present moment
            if (!end) {
                end = moment().unix();
            }
        }

        //array where to save the query result 
        let promises = [];
        let result = [];

        //handle case divided: [device,keyword] aggregated: [] and divided: [keyword,device] aggregated: []
        if (aggrFun.code <= 1) {
            for (device of devices) {
                for (keyword of keywords) {
                    promises.push(handlerCaseAggrFun0Or1(body, device, keyword, timePeriod, start, end, unit, aggrFun, granularity, store));
                }
            }
        }

        /*********************************************************************************** */

        await Promise.all(promises)
            .then((response) => {
                for (row of response) {
                    result.push(row);
                }
            })
            .catch(reason => {
                throw new Error(reason);
            });

        response.status(200).json({ status: 200, result });

    } catch (err) {
        console.error(err);
        response.status(400).json({ status: 400, errors: [{ error: 'Something went wrong' }] });
    }
}
);

async function handlerCaseAggrFun0Or1(body, device, keyword, timePeriod, start, end, unit, aggrFun, granularity, store) {
    //query FIBO database if store = true and timePeriod is defined
    const fiboDbQuery = { device: device, keyword: keyword, data: {} };
    console.log(start);
    if (store === true && timePeriod) {
        try {
            fiboDbQuery.data = await database.query(start, device, keyword,
                aggrFun.name, aggrFun.code.toString(), timePeriod.key,
                timePeriod.number.toString(), granularity.toString());
        } catch (error) {
            console.error(error);
        }
    }
    return fiboDbQuery;
}

//middleware to handling error
app.use(errorJSONParser);
app.use(SanitizerErr);
app.use(genericError);