const fetch = require('node-fetch');

async function fetchData(workspaceid, devices, tags, token, start, end){

    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        redirect: 'follow'
    };

    const response = await fetch (`https://api.zdm.stage.zerynth.com/v1/tsmanager/workspace/%7Bwks-4te7zwo60htn%7D?sort=-timestamp_device&size=-1`, options);
    const json = await response.text();
    return json;
}


fetchData('wks-4te7zwo60htn', null, null, 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1ODY3NjY1MTgsImV4cCI6MTU4OTM1ODUxOCwidWlkIjoiUWxpYnBxemZSLXlOSElkbG1HODJ4USIsImx0cCI6bnVsbCwib3JnIjoiIiwiaXNzIjoiemVyeW50aCIsImp0aSI6IklfMkJDZWRzU2pHYUhTOXZyTUUxVHcifQ.WHrVopE2jAceCkaA8Oe_Ukmcfj8hy2ZNqIJRGiSdryo',
    null, null)
    .then( res => console.log(res))
    .catch( err => console.error(err));


exports.fetchData=fetchData;