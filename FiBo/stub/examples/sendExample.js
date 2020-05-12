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
            'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicHJvamVjdG5hbWUiOiJwcm92YSIsImZsZWV0c1pkbUlkcyI6WyJmbHQtNHVyaXducnBsNHU2IiwiZmx0LTR1cml4dnVsa3d4ciIsImZsdC00dXJpeWpoc2hhcmsiXSwiZmxlZXRJZHMiOlsiOWZjNDI1ZjEtMTUxNC00OTFhLWI0YzQtMjdlOGI2YjBiODZiIiwiNTA3ZTM3MDktODliOS00ZjYyLTgwN2EtMDJiMzNmNzE1NDA4IiwiY2UzMTI5N2MtOGUwYS00ZGY3LTg0MzItYzBkN2ZlMGY4NGFkIl0sImlhdCI6MTU4OTI5MDYzMiwiZXhwIjoxNTg5Mzc3MDMyfQ.9nIlyjgmBBFvh5xOZA2FBfj3qAr7fAlaXzkxBYcAOdE'
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
        { tag: "bathroom", value: "temp" },
    ],[
        {tag:'safe', value:'temp'}
    ]
    ],
    fleet: 'flt-4urixvulkwxr',
    aggregationFunction: 'mean',
    timeRange: { key: 'day', number:  2 },
    unit: 's',
    granularity: { key: 'hour', number: 1 },
    store: true
}

/*
    start: 1588760040,
    end: 1588760240, */

//console.log(JSON.stringify(request, null, 2));

const loginRequest = {
    username: 'admin',
    password: 'admin',
    projectName: 'prova'
}


const start = Date.now();
send(request)
    .then((json) => {
        console.log(json); 
        if (json.result){
            for (let item of json.result){
                console.log(item.tags);
                console.log(item.values);
                console.log(item.timeSeries);
            }
        }
        console.log(Date.now() - start)
    })
    .catch(err => console.log(err));


async function tryFun(request) {
    while (true) {
        const start = Date.now();
        await send(loginRequest).then((json) => { console.log(json); console.log(Date.now() - start) }).catch(err => console.log(err));
    }
}