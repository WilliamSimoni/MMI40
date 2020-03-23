const fetch = require('node-fetch');

async function sent(request) {
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

const requestTime = {
    projectName: 'Pierucci',
    device: ['pompa','caldaia'],
    keyword: ['temperatura','pressione'],
    aggregationFunction: { name: 'min', code: 5 },
    timePeriod: { key:'hour', number:12},
    granularity: 'minute',
    store: true
}

sent(requestTime).then((json) => {console.log(json)});
