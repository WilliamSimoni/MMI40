const fetch = require('node-fetch');
const moment = require('moment');

function postBody(projectName, device, keyword, aggrFun, timePeriod, granularity, store) {
    const request = {
        projectName: projectName,
        device: device,
        keyword: keyword,
        aggregationFunction: aggrFun,
        timePeriod: timePeriod,
        granularity: granularity,
        store: store
    }
    return request;
}

async function send(request) {

    const api_url = `http://localhost:7777/get`;
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request),
    };
    const response = await fetch(api_url, options);
    const json = await response.json();

    return json;
}

/*
start: moment.utc().subtract(2,'week').startOf('week').unix(),
    end: moment.utc().subtract(1,'week').startOf('week').unix(),
*/

const request = {
    projectName: 'pierucci',
    device: ['device1', 'device2'],
    keyword: ['temp', 'pression'],
    aggregationFunction: { name: 'sum', code: 5 },
    timePeriod:{key: 'week', number: 2},
    unit:'s',
    start: 1585381327,
    end: 1585386427,
    granularity: 7,
    store: false
}

//console.log(JSON.stringify(request, null, 2));

send(request).then((json) => {console.log(json)});
