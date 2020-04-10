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
            'Authorization':'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IldpbGxpYW0iLCJwcm9qZWN0bmFtZSI6ImZlcnJhcmkiLCJyb2xlaWQiOiJhMzQxNmIyZS04MTFiLTQyYTYtYWZlZi0yYzdlODFhMWI3YWYiLCJpYXQiOjE1ODY1MzMxNTEsImV4cCI6MTU4NjYxOTU1MX0.P9E3TcSWNEf7ieYcek2yBUo-VexEr-kZGEUn1lCNaZU'
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
    device: ['AE252', 'Second'],
    keyword: ['portata', 'temperature', "something else", "another thing", "and yet another one"],
    aggregationFunction: { name: 'sum', code: 4 },
    timePeriod: {key: 'minute', number: 2},
    granularity: {key: 'minute', number: 0.5},
    unit:'s',
    store: true
}

//console.log(JSON.stringify(request, null, 2));

const loginRequest = {
    username:'William',
    password:'12345678',
    projectName: 'ferrari'
}

send(request).then((json) => {console.log(json)}).catch(err => console.log(err));
