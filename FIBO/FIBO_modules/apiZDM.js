const fetch = require('node-fetch');
/*
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
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1ODY4NTAzODMsImV4cCI6MTU4OTQ0MjM4MywidWlkIjoiUWxpYnBxemZSLXlOSElkbG1HODJ4USIsImx0cCI6bnVsbCwib3JnIjoiIiwiaXNzIjoiemVyeW50aCIsImp0aSI6Ik5DU0IzMTBKVEZTQlFDdlJhbVVnT2cifQ.rE1LhFpYiWPu_gO7jsuiD-5Mal_fK3dHhRN7YcY5SY8',
    null, null)
    .then( res => console.log(res))
    .catch( err => console.error(err));
*/

//var myHeaders = new Headers();
//myHeaders.append("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1ODY4NTAzODMsImV4cCI6MTU4OTQ0MjM4MywidWlkIjoiUWxpYnBxemZSLXlOSElkbG1HODJ4USIsImx0cCI6bnVsbCwib3JnIjoiIiwiaXNzIjoiemVyeW50aCIsImp0aSI6Ik5DU0IzMTBKVEZTQlFDdlJhbVVnT2cifQ.rE1LhFpYiWPu_gO7jsuiD-5Mal_fK3dHhRN7YcY5SY8");

var requestOptions = {
    method: 'GET',
    headers: {
        'Authorization': "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1ODcxMzU1OTgsImV4cCI6MTU4OTcyNzU5OCwidWlkIjoiUWxpYnBxemZSLXlOSElkbG1HODJ4USIsImx0cCI6bnVsbCwib3JnIjoiIiwiaXNzIjoiemVyeW50aCIsImp0aSI6Ijc5eU9Jdy15U2p1QVRaTVZwczM1cncifQ.J1umxIXhktB3s5L9X0Q40DRmtU-kurHsZ7zSZjXuN6Y"
    },
    redirect: 'follow'
};

fetch("https://api.zdm.zerynth.com/v1/tsmanager/workspace/wks-4ter9zkrpb99?sort=-timestamp_device&size=-1&tag=primo%20piano&tag=bagno", requestOptions)
    .then(response => response.json())
    .then(result => {})
    .catch(error => console.log('error', error));

//exports.fetchData = fetchData;