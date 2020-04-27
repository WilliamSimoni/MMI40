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
            'Authorization':'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlBpbm8iLCJwcm9qZWN0bmFtZSI6InByb3ZhIiwiZmxlZXRzWmRtSWRzIjpbImZsdC00dXJpeWpoc2hhcmsiXSwiZmxlZXRJZHMiOlsiYjczZTk2ZDktOWFhZC00YmUyLTgzZTQtMzQxNDJlYmViZjRjIl0sImlhdCI6MTU4ODAwMjAzNSwiZXhwIjoxNTg4MDg4NDM1fQ.3vxUZpKuRFCDBXzMIZlW1VsTtST8CN-GjQc-FV3tvfg'
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
    aggrFunPerGroup: ['sum', 'sum'],
    aggregationFunction: 'max',
    timeRange: {key: 'hour', number: 100},
    granularity: {key: 'minute', number: 10},
    unit:'s',
    store: true
}

//console.log(JSON.stringify(request, null, 2));

const loginRequest = {
    username:'Pino',
    password:'12345678',
    projectName:'prova'
}


const start = Date.now();
send(request).then((json) => {console.log(json.result[1].timeSeries); console.log(Date.now() - start)}).catch(err => console.log(err));


