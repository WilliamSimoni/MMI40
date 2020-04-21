const fetch = require('node-fetch');

const API_URL = `http://localhost:7778/aggregate`;

const legalFunctions = [
    'sum',
    'mean',
    'max',
    'min'
]

async function aggrFun(aggrName, projectName, tags, values, fleets, periods, granularities){
    const request = {
        aggrFun: aggrName,
        projectName: projectName,
        tags: tags,
        values: values,
        fleets: fleets,
        periods: periods,
        granularities: granularities
    };

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request),
    };
    const response = await fetch(API_URL, options);
    const json = await response.json();

    const result = json;

    return result;
}


exports.legalFunctions = legalFunctions;
exports.aggrFun = aggrFun;