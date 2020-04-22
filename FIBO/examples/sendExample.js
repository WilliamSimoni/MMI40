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
            'Authorization':'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlBpbm8iLCJwcm9qZWN0bmFtZSI6InByb3ZhIiwiZmxlZXRzWmRtSWRzIjpbImZsdC00dXJpeWpoc2hhcmsiXSwiZmxlZXRJZHMiOlsiM2E0ZjMwNTYtMTg3NC00OGY1LWJlZGUtOGE1NGY4NmYwYjI1Il0sImlhdCI6MTU4NzU0Mjg0MiwiZXhwIjoxNTg3NjI5MjQyfQ.SWp4mVVkvsU5LTzsBXbUos2yOtQqBxs7CP_XDtbADWc'
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
    tags: [['kitchen']],
    values: ['temp'],
    fleet: 'flt-4urixvulkwxr',
    aggregationFunction: 'mean',
    timePeriod: {key: 'hour', number: 1},
    start: 1584257168,
    granularity: {key: 'second', number: 312},
    unit:'s',
    store: true
}

//console.log(JSON.stringify(request, null, 2));

const loginRequest = {
    username:'Pino',
    password:'12345678',
    projectName:'prova'
}

const periods = [1587135594, 1587139194,
    1587142794, 1587146394, 1587149994,
    1587153594, 1587157194, 1587160794,
    1587164394, 1587167994, 1587171594,
    1587175194, 1587178794, 1587182394,
    1587185994, 1587189594, 1587193194,
    1587196794, 1587200394, 1587203994,
    1587207594, 1587211194, 1587214794,
    1587218394
  ];

const aggregateRequest = {
    aggrFun: 'sum',
    projectName: 'Prova',
    tags: [['bagno'], ['camera'], ['bagno','camera']],
    values: ['temp', 'humidity'],
    fleets: ['flt-4tera0062rzy'],
    periods: [{start: 1587131994, end: 1587181994}],
    granularities: [{key:'hour', number:1}]
}

send(request).then((json) => console.log(json)).catch(err => console.log(err));


