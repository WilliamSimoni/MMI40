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
            'Content-Type': 'application/json',
            'Authorization':'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlBpbm8iLCJwcm9qZWN0bmFtZSI6InByb3ZhIiwiZmxlZXRzWmRtSWRzIjpbImZsdC00dXJpeWpoc2hhcmsiXSwiZmxlZXRJZHMiOlsiM2E0ZjMwNTYtMTg3NC00OGY1LWJlZGUtOGE1NGY4NmYwYjI1Il0sImlhdCI6MTU4NzcyMjAxOSwiZXhwIjoxNTg3ODA4NDE5fQ.bHdH4uv7s-e9ZeSmWVTUbvKkdsvZ46R3bTFckSGECsw'
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
    projectName: 'Prova',
    timeSeries: [[{tag:'kitchen', value:'temp'}, {tag:'safe', value:'temp'}], [{tag:'safe', value:'temp'}]],
    fleet: 'flt-4urixvulkwxr',
    aggrFunPerGroup: ['min', 'max'],
    aggregationFunction: 'min',
    timeRange: {key: 'minute', number: 10},
    granularity: {key: 'second', number: 30},
    unit:'s',
    store: true
}

//console.log(JSON.stringify(request, null, 2));

const loginRequest = {
    username:'Pino',
    password:'12345678',
    projectName:'prova'
}

send(request).then((json) => console.log(json.result)).catch(err => console.log(err));


