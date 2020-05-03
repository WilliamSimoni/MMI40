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
            'Authorization':'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicHJvamVjdG5hbWUiOiJwcm92YSIsImZsZWV0c1pkbUlkcyI6WyJmbHQtNHVyaXducnBsNHU2IiwiZmx0LTR1cml4dnVsa3d4ciIsImZsdC00dXJpeWpoc2hhcmsiXSwiZmxlZXRJZHMiOlsiOWZjNDI1ZjEtMTUxNC00OTFhLWI0YzQtMjdlOGI2YjBiODZiIiwiNTA3ZTM3MDktODliOS00ZjYyLTgwN2EtMDJiMzNmNzE1NDA4IiwiY2UzMTI5N2MtOGUwYS00ZGY3LTg0MzItYzBkN2ZlMGY4NGFkIl0sImlhdCI6MTU4ODQ4ODYyOSwiZXhwIjoxNTg4NTc1MDI5fQ.Ba2fmIvkDeobgDsNgC0ZXo5MDZP3YAgg7gtz4dCTdSE'
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
    timeSeries: [[
        { tag:"bathroom", value: "humidity" },
        { tag:"kitchen", value: "temp" },
    ],[
        { tag:"kitchen", value: "temp" },
    ]
    ],
    fleet: 'flt-4urixvulkwxr',
    aggrFunPerGroup: ['mean', 'mean'],
    aggregationFunction: 'mean',
    timeRange: {key: 'day', number: 1},
    granularity: {key: 'hour', number: 1},
    store: true
}


//console.log(JSON.stringify(request, null, 2));

const loginRequest = {
    username:'admin',
    password:'admin',
    projectName:'prova'
}


const start = Date.now();
send(request).then((json) => {console.log(json); console.log(Date.now() - start)}).catch(err => console.log(err));


async function tryFun(request){
    while(true){
        const start = Date.now();
        await send(request).then((json) => {console.log(json); console.log(Date.now() - start)}).catch(err => console.log(err));
    }
}