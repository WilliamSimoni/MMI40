const error = require('./FIBO_modules/failComunication')
const sorting = require('./FIBO_modules/sorting');
const calculator = require('./FIBO_modules/calculator')

const express = require('express');
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
    error.fail(error.errors.BADREQUEST, err.body, response);
    return;
}

//add middleware which parse in json the body of the post request.
//limit means that the maximum body dimension in a post request is 1 megabyte
app.use(express.json({ limit: '1mb' }));

//TODO middleware for autentication

//add midlleware which validate input sent by client
app.use('/get', (request, response, next) => {
    const requestBody = request.body;

    //DELETE?
    if (requestBody === null || typeof requestBody === 'undefined') {
        error.fail(error.errors.BADREQUEST, requestBody, response);
        return;
    }

    let projectName = requestBody.projectName;
    let device = requestBody.device;
    let keyword = requestBody.keyword;
    let aggrFun = requestBody.aggregationFunction;
    let timePeriod = requestBody.timePeriod;
    let granularity = requestBody.granularity;
    let storeFlag = requestBody.store;

    //projectName control

    if (typeof projectName !== 'string') {
        error.fail(error.errors.BADREQUEST, requestBody, response);
        return;
    }
    //deleting white spaces and then checking projectname length
    projectName = projectName.replace(/\W+/g, '');
    if (projectName.length === 0) {
        error.fail(error.errors.BADREQUEST, requestBody, response);
        return;
    }
    projectName = projectName.replace(/\w+/g, (match) => match.toLowerCase());
    //device control

    if (!Array.isArray(device)) {
        error.fail(error.errors.BADREQUEST, requestBody, response);
        return;
    }
    if (device.length === 0) {
        error.fail(error.errors.BADREQUEST, requestBody, response);
        return;
    }

    //keyword control

    if (!Array.isArray(keyword)) {
        error.fail(error.errors.BADREQUEST, requestBody, response);
        return;
    }
    if (keyword.length === 0) {
        error.fail(error.errors.BADREQUEST, requestBody, response);
        return;
    }

    //aggregationFunction control if data is sent (not if the content is right)

    if (typeof aggrFun === 'undefined') {
        error.fail(error.errors.BADREQUEST, requestBody, response);
        return;
    }
    if (typeof aggrFun.name !== 'string' || typeof aggrFun.code !== 'number') {
        error.fail(error.errors.BADREQUEST, requestBody, response);
        return;
    }

    //time control
    //flag, if true then the Client has sent timperiod defined as {key: , number:}
    //if false then the Client has sent timeperiod definded as {start: , end:, unit:}
    let timePeriodDefined = false;

    if (typeof timePeriod === 'undefined') {
        error.fail(error.errors.BADREQUEST, requestBody, response);
        return;
    }

    //case client sent timeperiod defined as {key: , number: }
    if (typeof timePeriod.key === 'string' && typeof timePeriod.number === 'number') {
        //timeperiod.number must be > 0
        if (timePeriod.number <= 0) {
            error.fail(error.errors.BADREQUEST, requestBody, response);
            return;
        }
        timePeriod.key = timePeriod.key.replace(/\W+/g, '');
        if (!(/\b(second|minute|hour|day|week|month|year)\b/g.test(timePeriod.key))) {
            error.fail(error.errors.BADREQUEST, requestBody, response);
            return;
        }
        timePeriodDefined = true;
    } else //case timeperiod defined as {start: , end:, unit:}
        if (typeof timePeriod.start === 'number' && typeof timePeriod.end === 'number' && typeof timePeriod.unit === 'string') {
            timePeriod.unit = timePeriod.unit.replace(/\W+/g, '');
            if (!(/\b(n|m|s)\b/g).test(timePeriod.unit)) {
                error.fail(error.errors.BADREQUEST, requestBody, response);
                return;
            }
        } else {
            error.fail(error.errors.BADREQUEST, requestBody, response);
            return;
        }



    //granularity control

    if (typeof granularity === 'number') {
        if (granularity <= 0) {
            error.fail(error.errors.BADREQUEST, requestBody, response);
            return;
        }
    } else if (typeof granularity === 'string' && timePeriodDefined === true) {
        granularity = granularity.replace(/\W+/g, '');
        if(!(/\b(minute|hour|day|week|month|year)\b/g).test(granularity)){
            error.fail(error.errors.BADREQUEST, requestBody, response);
            return;
        }

        //checking granularity content
        switch (granularity) {
            case 'minute':
                if (/\b(second|day|week|month|year)\b/g.test(timePeriod.key)) {
                    error.fail(error.errors.GRANULARITYNOTSUPPORTED, requestBody, response);
                    return;
                }
                break;
            case 'hour':
                if (/\b(second|minute|month|year)\b/g.test(timePeriod.key)) {
                    error.fail(error.errors.GRANULARITYNOTSUPPORTED, requestBody, response);
                    return;
                }
                break;
            case 'week':
                if (/\b(second|minute|hour|day)\b/g.test(timePeriod.key)) {
                    error.fail(error.errors.GRANULARITYNOTSUPPORTED, requestBody, response);
                    return;
                }
                break;
            case 'month':
                if (/\b(second|minute|hour|day|week)\b/g.test(timePeriod.key)) {
                    error.fail(error.errors.GRANULARITYNOTSUPPORTED, requestBody, response);
                    return;
                }
                break;
            case 'year':
                if (/\b(second|minute|hour|day|week|month)\b/g.test(timePeriod.key)) {
                    error.fail(error.errors.GRANULARITYNOTSUPPORTED, requestBody, response);
                    return;
                }
                break;
        }
    } else {
        error.fail(error.errors.BADREQUEST, requestBody, response);
        return;
    }

    //store control
    if (typeof storeFlag !== 'boolean') {
        error.fail(error.errors.BADREQUEST, requestBody, response);
        return;
    }

    //variables used to query FIBO db
    let deviceQueryString = '';
    let keywordQueryString = '';

    //Ordering device array, deleting spaces from device 
    //item in device array. Then checking if item.length == 0. 
    //Eventually creating device string for FIBO db query

    device = sorting.algorithm(device);
    for (item of device) {
        item = item.replace(/\W+/g, '');
        if (item.length === 0) {
            error.fail(error.errors.BADREQUEST, requestBody, response);
            return;
        }
        deviceQueryString += item;
    }

    //Ordering keyword array, deleting spaces from keyword 
    //item in keyword array. Then checking if item.length == 0.
    //Eventually creating keyword string for FIBO db query.

    keyword = sorting.algorithm(keyword);
    for (item of keyword) {
        //if (typeof item) ??
        item = item.replace(/\W+/g, '');
        if (item.length === 0) {
            error.fail(error.errors.BADREQUEST, requestBody, response);
            return;
        }
        keywordQueryString += item;
    }

    //checking content of aggregation function object
    aggrFun.name = aggrFun.name.replace(/\W+/g, '');
    if (!calculator.legalFunctions.includes(aggrFun.name)) {
        error.fail(error.errors.NOTSUPPORTEDFUNCTION, requestBody, response);
        return;
    }
    if (!calculator.legalCodes(aggrFun.code)) {
        error.fail(error.errors.NOTSUPPORTEDFUNCTION, requestBody, response);
        return;
    }

    requestBody.projectName = projectName;
    requestBody.device = device;
    requestBody.keyword = keyword;
    requestBody.aggregationFunction = aggrFun;
    requestBody.timePeriod = timePeriod;
    requestBody.granularity = granularity;
    requestBody.store = storeFlag;
    requestBody.deviceQuery = deviceQueryString;
    requestBody.keyworQuery = keywordQueryString;

    next();
});

app.post('/get', (request, response) => {
    const requestBody = request.body;
    console.log(requestBody);
    response.json({ status: 200 });
});

app.use(logError);
app.use(errorJSONParser);
app.use(genericError);