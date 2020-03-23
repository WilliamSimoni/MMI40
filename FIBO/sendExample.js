const fetch = require('node-fetch');

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
    projectName: 'PIERUCCI',
    device: ['temperatura','caldaia'],
    keyword: ['temperatura       ','pressione'],
    aggregationFunction: { name: 'min', code: 1 },
    timePeriod: { start:123242, end: 132132, unit:'h' },
    granularity: 12,
    store: true
}

send(request).then((json) => {console.log(json);});
