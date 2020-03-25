const fetch = require('node-fetch');

//used to query database
const Influx = require('influxdb-nodejs');
const client = new Influx('http://127.0.0.1:8086/mydb');

const MEASUREMENT1 = 'devicedata';

//used to write into database
async function writeData(measurement, project, device, keyword, aggregationFunctionName, aggregationFunctionCode, timePeriodKey, timePeriodLength, granularity, value, timestamps) {
    let bodyPost = '';
    for (let i = 0; i < timestamps.length; i++) {
        bodyPost += `${measurement},project=${project},device=${device},keyword=${keyword},aggregationFunctionName=${aggregationFunctionName},aggregationFunctionCode=${aggregationFunctionCode},timePeriodKey=${timePeriodKey},timePeriodLength=${timePeriodLength},granularity=${granularity},singlePeriodLength=21 value=${value[i]} ${timestamps[i]}\n`
    }
    const options = {
        method: 'POST',
        body: bodyPost
    }
    const api_database_url = 'http://localhost:8086/write?db=mydb&precision=s'
    const result = await fetch(api_database_url, options);
    console.log(result);
}

//used to create reader object 
function createReader(device, keyword, aggrFunName, aggrFunCode, timePeriodKey, timePeriodLength, granularity, start) {
    let reader = client.query('request');
    reader.set({ 'format': 'json', 'epoch': 's' });
    reader.measurement = MEASUREMENT1;
    reader.addField('value', 'singlePeriodLength');
    //wehre conditions
    reader.where('time', start, '>=');
    reader.where('device', device);
    reader.where('keyword', keyword);
    reader.where('aggregationFunctionName', aggrFunName);
    reader.where('aggregationFunctionCode', aggrFunCode);
    reader.where('timePeriodKey', timePeriodKey);
    reader.where('timePeriodLength', timePeriodLength);
    reader.where('granularity', granularity);
    return reader;
}

//used to query database when aggregation function code is 0 or 1

/**
 * Used to query database, For every device of devices and keyword of keywords:
 * SELECT value,singlePeriodLength FROM 'devicedata' WHERE
 * time >= start AND device=device AND keyword=keyword AND aggregationFunctionName=aggrFunName
 * AND aggregationFunctionCode=aggrFunCode AND timePeriodKey=timePeriodKey AND
 * timePeriodLength=timePeriodLength AND granularity=granularity
 * @param {number} start - timestamp in nanosecond which indicates the time from where start
 * @param {string} measurement
 * @param {string} devices
 * @param {string} keywords
 * @param {string} aggrFunName
 * @param {string} aggrFunCode
 * @param {string} timePeriodKey
 * @param {string} timePeriodLength
 * @param {string} granularity
 */

function query(start, device, keyword, aggrFunName, aggrFunCode, timePeriodKey, timePeriodLength, granularity) {
    device = device.replace(/\W+/g, '');
    keyword = keyword.replace(/\W+/g, '');
    const reader = createReader(device, keyword, aggrFunName, aggrFunCode, timePeriodKey, timePeriodLength, granularity, start);
    return reader.then();
}

exports.writeData = writeData;
exports.query = query;