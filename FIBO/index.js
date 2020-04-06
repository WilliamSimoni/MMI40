//setting environment variables with dotenv
require('dotenv').config();
const PORT = process.env.PORT || 7777;
const MAX_POINT = process.env.MAX_POINT || 400;

const sorting = require(`./FIBO_modules/sorting`);
const calculator = require(`./FIBO_modules/calculator`);
const { SanitizerError } = require(`./Error_Class/SanitizerError`);
const { Database } = require(`./FIBO_modules/database`);

//Creating Database
const database = new Database();

//For handling time mutations
const { time, rounder } = require(`./FIBO_modules/time`);

var compression = require('compression');
const express = require('express');
const { validationResult, body } = require('express-validator');
const app = express();
app.use(compression());


const server = app.listen(PORT, () => { console.log(`listening on ${PORT}`) });

//functions to handle errors

function errorJSONParser(err, request, response, next) {
    if (err instanceof SyntaxError && err.status === 400) {
        response.status(400).json({ status: 400, errors: ['body must be in json'] });
        return;
    }
    next(err);
}

function SanitizerErr(err, request, response, next) {
    if (err instanceof SanitizerError && err.status === 400) {
        response.status(400).json({ status: 400, errors: [err.message] });
        return;
    }
    next(err);
}

function genericError(err, request, response, next) {
    console.error(err.stack);
    response.status(400).json({ status: 400, errors: ['Something went wrong'] });
    return;
}

//add middleware which handle CORS problems
app.use((request, response, next) => {
    response.header("Access-Control-Allow-Origin", '*');
    response.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );
    if (request.method === 'OPTIONS'){
        response.header('Access-Control-Allow-Methods', 'PUT, GET');
        return res.status(200).json({});
    }
    next();
});


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
        .if(body('granularity').isInt())
        .isInt({ min: 1 }).withMessage('granularity must be an integer > 0 or a string if TimePeriod is defined').bail()
        .custom((granularity, { req }) => {
            req.body.granularityIsNumeric = true;
            return true;
        }),
    body('granularity')
        .if(body('granularity').not().isInt())
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
        }).bail()
        .custom((granularity, { req }) => {
            req.body.granularityIsNumeric = false;
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
        let devices = body.device;
        let keywords = body.keyword;
        let timePeriod = body.timePeriod;
        let start = body.start;
        let end = body.end;
        let unit = body.unit;
        let aggrFun = body.aggregationFunction;
        let granularity = body.granularity;
        let store = body.store;

        //true if granularity is sent as number
        const granularityIsNumeric = body.granularityIsNumeric;

        //point Number to Sent
        let pointNumber;

        //timeSeriesStart is the beginning of the time series that will be sent to the Client.
        let timeSeriesStart;
        //timeSeriesStartAfterOnePeriod is timeSeriesStart + granularity
        let timeSeriesStartAfterOnePeriod;

        //request timestamp
        let now = time.now();

        //if start is not defined, the start moment is defined by timePeriod 
        if (!start) {
            start = time.subtract(time.now(), timePeriod.number, timePeriod.key);
            timeSeriesStart = start;
            end = now;
        } else {
            if (timePeriod) {
                timeSeriesStart = time.subtract(time.now(), timePeriod.number, timePeriod.key);
            } else {
                timeSeriesStart = start;
            }

            //if end is not defined, the end moment is the present moment
            if (!end) {
                end = now;
            }
        }

        if (start < timeSeriesStart) {
            response.status(400).json({ status: 400, errors: ['start sent less than timePeriod'] });
            return;
        }

        if (start > now) {
            response.status(400).json({ status: 400, errors: ['start sent higher than timePeriod'] });
            return;
        }

        //calculating timePeriodInSecond

        let timePeriodInSecond;

        if (timePeriod) {
            timePeriodInSecond = time.convertSecond(timePeriod.number, timePeriod.key);
        } else {
            timePeriodInSecond = end - start;
        }


        //mutating granularity in the form {key: number:} if is a number and calculating timeSeriesStart. Also
        //calculating granularityInSecond.

        let granularityInSecond;

        if (granularityIsNumeric) {
            //Using the rule defined in roundGran1 it rounds timeSeriesStart. Then it increments timeSeriesStart untill it is higher than start.
            if (store === true || timePeriod) {
                timeSeriesStart = time.round(timeSeriesStart, rounder.roundGran1(timePeriodInSecond));
                granularity = { key: 'second', number: Math.floor((end - timeSeriesStart) / granularity) };
            } else {
                granularity = { key: 'second', number: Math.floor(timePeriodInSecond / granularity) };
            }
            //converting granularity in second
            granularityInSecond = time.convertSecond(granularity.number, granularity.key);
        } else {
            //converting granularity in second
            granularityInSecond = time.convertSecond(granularity.number, granularity.key);
            //Using the rule defined in roundGran2 it rounds timeSeriesStart. Then it increments timeSeriesStart untill it is higher than start.
            timeSeriesStart = time.nearestMoment(time.round(timeSeriesStart, rounder.roundGran2(granularityInSecond)), granularity.number, granularity.key, start);
        }

        //check 
        if (granularityInSecond > timePeriodInSecond) {
            response.status(400).json({ status: 400, errors: ['granularity higher than total Period Length'] });
            return;
        }

        //calculating pointNumber
        pointNumber = Math.floor((end - timeSeriesStart) / granularityInSecond);

        if (pointNumber > MAX_POINT) {
            response.status(401).json({ status: 401, errors: ['too many points'] });
            return;
        }

        //if store is true then devices and keyword must be sorted TODO


        //array where to save the query result 
        let result = [];
        // lastTime contains from when query ZDM based on the last time stored in db (if store is true). If store is 
        //false then every lastTime element is timeSeriesStart.
        let lastTime = {};
        let queryResult = [];

        timeSeriesStartAfterOnePeriod = time.add(timeSeriesStart, granularity.number, granularity.key) - 1;

        //query database
        try {
            if (store === true) {
                queryResult = await database.queryDeviceData(project, devices, keywords, aggrFun.name, aggrFun.code.toString(), timePeriod.key, timePeriod.number.toString(), granularity.key, granularity.number.toString(), start * 1000000000);
                for (item of queryResult) {
                    const timeSeriesLength = item.timeSeries.length;
                    for (device of item.device) {
                        for (keyword of item.keyword) {
                            if (!lastTime[device])
                                lastTime[device] = [];
                            if (timeSeriesLength === 0) {
                                lastTime[device].push({ keywordName: keyword, time: timeSeriesStartAfterOnePeriod });
                            } else {
                                lastTime[device].push({ keywordName: keyword, time: time.add(item.timeSeries[timeSeriesLength - 1].time, granularity.number, granularity.key) });
                            }
                        }
                    }
                }
            } else {
                for (device of devices) {
                    for (keyword of keywords) {
                        if (!lastTime[device])
                            lastTime[device] = [];
                        lastTime[device].push({ keywordName: keyword, time: timeSeriesStartAfterOnePeriod });
                    }
                }
            }
        } catch (err) {
            store = false;
            for (device of devices) {
                for (keyword of keywords) {
                    if (!lastTime[device])
                        lastTime[device] = [];
                    lastTime[device].push({ keywordName: keyword, time: timeSeriesStartAfterOnePeriod });
                }
            }
            console.error(err);
        }

        //console.log(queryResult);
        //console.log(lastTime);

        /*********************************************************************************** */
        //API PART

        //
        let periodsList = {};
        /*
                const defaultPeriods = time.createPeriods(time.add(timeSeriesStart, granularity.number, granularity.key) - 1, granularity.number, granularity.key, end);
                const timeSeriesEnd = defaultPeriods[defaultPeriods.length-1];
        */
        //query ZDM database
        for (device in lastTime) {
            //query ZDM from time set in lastTime object and timeSeriesEnd.  
            for (keyword of lastTime[device]) {
                //simulate query
                if (!periodsList[keyword.time]) {
                    periodsList[keyword.time] = time.createPeriods(keyword.time, granularity.number, granularity.key, end);
                    //console.log(keyword.time, periodsList[keyword.time]);
                }
                //generate random time Serie
                keyword.periods = createTimeSeries(periodsList[keyword.time], 50);
            }
        }



        //random data generator
        //timeSeriesStart = time.add(timeSeriesStart, granularity.number, granularity.key);
        //console.log(periods);
        /*********************************************************************************** */
        //console.log(timeToStart,granularity.number, granularity.key, end, time.add(timeToStart,granularity.number,granularity.key));

        //send data to Calculator
        result = await calculator.aggrFun(aggrFun.name, aggrFun.code, lastTime)
            .catch(err => console.error(err));
/*
        if (store === true) {
            //add calculate data to data obtained from database
            for (let i = 0; i < queryResult.length; i++) {
                queryResult[i].timeSeries = [...queryResult[i].timeSeries, ...result[i].timeSeries];
            }
            //save new data in database
            database.writeDeviceData(project, result, aggrFun.name, aggrFun.code.toString(), timePeriod.key, timePeriod.number.toString(), granularity.key, granularity.number.toString())
                .catch(err => console.error(err));

            result = queryResult;
        }*/

        response.status(200).json({ status: 200, result, pointNumber, timeSeriesStart });

    } catch (err) {
        console.error(err);
        response.status(400).json({ status: 400, errors: ['Something went wrong'] });
    }
}
);


//middleware to handling error
app.use(errorJSONParser);
app.use(SanitizerErr);
app.use(genericError);

//only for now
function createRandomTimeSeries(devices, keywords, per, cardinalityValues) {
    let periods = {};
    for (dev of devices) {
        let device = [];
        for (key of keywords) {
            let keyword = [];
            for (timestamp of per) {
                let values = [];
                for (let i = 0; i < cardinalityValues; i++) {
                    const value = Math.floor(Math.random() * 5);
                    values.push(value);
                }
                keyword.push({ timestamp, values });;
            }
            device.push({ keywordName: key, periods: keyword });
        }
        periods[dev] = device;
    }

    return periods;
}

function createTimeSeries(per, cardinalityValues) {
    const res = [];
    for (timestamp of per) {
        let values = [];
        for (let i = 0; i < cardinalityValues; i++) {
            const value = Math.floor(Math.random() * 5);
            values.push(value);
        }
        res.push({ timestamp, values });;
    }
    return res;
}