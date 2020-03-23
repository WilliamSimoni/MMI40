const error = require('./FIBO_modules/failComunication')
const sorting = require('./FIBO_modules/sorting');
const calculator = require('./FIBO_modules/calculator')

const express = require('express');
const { validationResult, body, check } = require('express-validator');
const app = express();

//setting environment variables with dotenv
require('dotenv').config();
const PORT = process.env.PORT || 7777;

const server = app.listen(PORT, () => { console.log(`listening on ${PORT}`) });

//functions to handle errors TODOBETTER

function logError(err, request, response, next) {
    console.error(err.stack);
    next(err);
}

function errorJSONParser(err, request, response, next) {
    if (err instanceof SyntaxError && err.status === 400) {
        error.fail(error.errors.BADREQUEST, request.body, response);
        return;
    }
    next(err);
}

function genericError(err, request, response, next) {
    response.status(400).json({ status: 400, errors: { msg: err.message } });
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
        .custom((device, { req }) => {
            let deviceQueryString = '';
            device = sorting.algorithm(device);
            for (let i = 0; i < device.length; i++) {
                if (typeof device[i] !== 'string') {
                    throw new Error('device elements must be not empty string');
                }
                device[i] = device[i].replace(/\W+/g, '');
                if (device[i].length === 0) {
                    throw new Error('device elements must be not empty string');
                }
                deviceQueryString += device[i];
            }
            req.body.deviceQueryString = deviceQueryString;
            return device;
        }),
    body('keyword')
        .exists().withMessage('Bad Request').bail()
        .isArray({ min: 1 }).withMessage('keyword is not valid').bail()
        .customSanitizer((keyword, { req }) => {
            let keywordQueryString = '';
            keyword = sorting.algorithm(keyword);
            for (let i = 0; i < keyword.length; i++) {
                if (typeof keyword[i] !== 'string') {
                    throw new Error('keyword elements must be not empty string');
                }
                keyword[i] = keyword[i].replace(/\W+/g, '');
                if (keyword[i].length === 0) {
                    throw new Error('keyword elements must be not empty string');
                }
                keywordQueryString += keyword[i];
            }
            req.body.keywordQueryString = keywordQueryString;
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
                    throw new Error('timePeriod number must be > 0');
                }
                timePeriod.key = timePeriod.key.replace(/\W+/g, '');
                if (!(/\b(second|minute|hour|day|week|month|year)\b/g.test(timePeriod.key))) {
                    throw new Error('timePeriod key is not valid');
                }
                req.body.timePeriodType1 = true;
                return timePeriod;
            }
            
            if (typeof timePeriod.start === 'number' && typeof timePeriod.end === 'number' && typeof timePeriod.unit === 'string') {
                req.body.timePeriodType1 = false;
                return timePeriod;
            }

            throw new Error('Time Period is not valid');
        }),
    body('granularity')
        .exists().withMessage('Bad Request').bail()
        .customSanitizer((granularity, { req }) => {
            if (typeof granularity === 'number') {
                if (granularity <= 0) {
                    throw new Error('granularity must be > 0');
                }
            } else if (typeof granularity === 'string' && req.body.timePeriodType1 === true) {
                granularity = granularity.replace(/\W+/g, '');
                if (!(/\b(minute|hour|day|week|month|year)\b/g).test(granularity)) {
                    throw new Error('granularity key is not correct');
                }

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
            } else {
                throw new Error('granularity must be a key or a number');
            }
            return granularity;
        }),
    body('store')
    .exists().withMessage('Bad Request').bail()
    .isBoolean().withMessage('store must be boolean true or false').bail()
], (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(400).json({ status: 400, errors: errors.array() });
    }
    response.status(200).json({ status: 200, request: request.body });
}
);

app.use(logError);
app.use(errorJSONParser);
app.use(genericError);