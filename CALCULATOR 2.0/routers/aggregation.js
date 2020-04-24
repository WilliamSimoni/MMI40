const rules = require('../rules/rules');

//For validating request
const { validationResult, body } = require('express-validator');
const {time} = require('../CALCULATOR_modules/time');
//express
const express = require('express');
const router = express.Router();

const { aggregation } = require('../CALCULATOR_modules/aggregation');

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
    body('tags')
        .isArray({ min: 1 }).bail()
        .custom(tags => {
            for (let tag of tags) {
                if (Array.isArray(tag)) {
                    if (tag.length === 0)
                        return false;
                }
            }
            return true;
        }),
    body('fleets')
        .isArray({ min: 1 }),
    body('values')
        .isArray({ min: 1 }),
    body('periods')
        .isArray({ min: 1 }).bail()
        .custom(periods => {
            for (let period of periods) {
                if (!period.start || !period.end) {
                    return false;
                }
            }
            return true;
        }),
    body('granularities')
        .isArray({ min: 1 }).bail()
        .custom(granularities => {
            for (let granularity of granularities) {
                if (!granularity.key || !granularity.number) {
                    return false;
                }
            }
            return true;
        }),
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
        const {
            aggrFun,
            projectName,
            tags,
            fleets,
            values,
            periods,
            granularities
        } = request.body;

        //divide periods in subPeriods according to granularities
        /*dividedPeriod is structured as follow: 
            dividePeriod: {
                period.start: [[

                ]]
            }
        */
        
        //console.log(periods);

        let dividedPeriods = {};
        for (period of periods){
            dividedPeriods[period.start] = [];
            for (granularity of granularities){
                dividedPeriods[period.start].push(time.createPeriods(period.start, granularity.number, granularity.key, period.end));
            }
        }

        //console.log(dividedPeriods[periods[0].start]);


        let promises = [];

        for (tag of tags) {
            for (period of periods) {
                promises.push(aggregation(aggrFun, projectName, tag, fleets, values, period.start, period.end, dividedPeriods[period.start]));
            }
        }
        
        const {result, invalid} = await Promise.all(promises)
        .then(res => {
          let result = [];
          let invalid = [];
          for (let item of res){
            result = [...result, ...item.finalResult];
            invalid = [...invalid, ...item.invalid];
          }
          return {result, invalid};
        })

        return response.status(200).json({status: 200, result, invalid});
    } catch (err) {
        console.error(err);
        return response.status(400).json({ status: 400, errors: ['something went wrong'] });
    }

});


exports.aggregator = router;