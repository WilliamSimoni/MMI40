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
    device: ['device3', 'device4', 'device1'],
    keyword: ['t', 'p'],
    aggregationFunction: { name: 'sum', code: 1 },
    timePeriod: {key: 'day', number: 1},
    granularity:{key: 'hour', number: 1},
    unit:'s',
    store: true
}

//console.log(JSON.stringify(request, null, 2));

send(request).then((json) => {console.log(json.result[0].timeSeries)});
