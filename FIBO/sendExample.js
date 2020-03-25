const fetch = require('node-fetch');

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
    const api_url = 'http://localhost:7777/get';
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

const request = {
    projectName: ' Pierucci',
    device: ['device 1','device 2'],
    keyword: ['temperature'],
    aggregationFunction: { name: 'sum', code: 0 },
    timePeriod: { key:'week', number:10},
    granularity: 12,
    store: true
}

send(request).then((json) => {console.log(json.result[1].result);});
