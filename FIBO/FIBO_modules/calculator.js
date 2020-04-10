const fetch = require('node-fetch');

const API_URL = `http://localhost:7778/aggrFun`;

const legalFunctions = [
    'sum',
    'mean',
    'max',
    'min'
]

/** 
    * @param {number} code - code that tells the calculator how to perform the function
*/
function legalCodes(code){
    if (code < 1 || code > 4){
        return false;
    }
    return true;
}   

async function aggrFun(aggrName, aggrCode, timeSeries){
    const request = {
        aggrFunName: aggrName,
        aggrFunCode: aggrCode,
        timeSeries: timeSeries,
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

    const {result} = json;

    return result;
}


exports.legalFunctions = legalFunctions;
exports.legalCodes = legalCodes;
exports.aggrFun = aggrFun;