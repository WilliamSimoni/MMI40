const { time } = require('../FIBO_modules/time');
const Influx = require('influxdb-nodejs');

const maxTimeDatabase = {
    hour12: 43200,
    day3: 259200,
    week2: 1209600,
    week4: 2419200,
    week8: 4838400,
    week26: 15724800,
    week52: 31449601,
}

class InfluxDB {
    /**
     * create influxDB clients and creates databases if it does not exist yet
     * */
    constructor() {
        if (!InfluxDB.instance) {

            //creating database clients, one database for every retention policy
            this.twentyFourHours = new Influx('http://127.0.0.1:8086/twentyFourHours');
            this.sixDays = new Influx('http://127.0.0.1:8086/sixDays');
            this.fourWeek = new Influx('http://127.0.0.1:8086/fourWeek');
            this.eightWeek = new Influx('http://127.0.0.1:8086/eightWeek');
            this.sixteenWeek = new Influx('http://127.0.0.1:8086/sixteenWeek');
            this.fiftyTwoWeek = new Influx('http://127.0.0.1:8086/fiftyTwoWeek');
            this.oneHundredFour = new Influx('http://127.0.0.1:8086/oneHundredFour');
            this.long = new Influx('http://127.0.0.1:8086/long');

            this.twentyFourHours.showDatabases()
                .then(result => {

                    if (!result.includes('twentyFourHours')) {
                        this.twentyFourHours.createDatabase()
                            .then(value => {
                                this.twentyFourHours.createRetentionPolicy('twentyFourHours', '24h', 1, null, true);
                            })
                            .catch(error => {
                                console.error(error)
                            })
                    }

                    if (!result.includes('sixDays')) {
                        this.sixDays.createDatabase()
                            .then(value => {
                                this.sixDays.createRetentionPolicy('sixDays', '6d', 1, null, true);
                            })
                            .catch(error => {
                                console.error(error)
                            })
                    }

                    if (!result.includes('fourWeek')) {
                        this.fourWeek.createDatabase()
                            .then(value => {
                                this.fourWeek.createRetentionPolicy('fourWeek', '4w', 1, null, true);
                            })
                            .catch(error => {
                                console.error(error)
                            })
                    }


                    if (!result.includes('eightWeek')) {
                        this.eightWeek.createDatabase()
                            .then(value => {
                                this.eightWeek.createRetentionPolicy('eightWeek', '8w', 1, null, true);
                            })
                            .catch(error => {
                                console.error(error)
                            })
                    }

                    if (!result.includes('sixteenWeek')) {
                        this.sixteenWeek.createDatabase()
                            .then(value => {
                                this.sixteenWeek.createRetentionPolicy('sixteenWeek', '16w', 1, null, true);
                            })
                            .catch(error => {
                                console.error(error)
                            })
                    }


                    if (!result.includes('fiftyTwoWeek')) {
                        this.fiftyTwoWeek.createDatabase()
                            .then(value => {
                                this.fiftyTwoWeek.createRetentionPolicy('fiftyTwoWeek', '52w', 1, null, true);
                            })
                            .catch(error => {
                                console.error(error)
                            })
                    }

                    if (!result.includes('oneHundredFour')) {
                        this.oneHundredFour.createDatabase()
                            .then(value => {
                                this.oneHundredFour.createRetentionPolicy('oneHundredFour', '104w', 1, null, true);
                            })
                            .catch(error => {
                                console.error(error)
                            })
                    }

                    if (!result.includes('long')) {
                        this.long.createDatabase()
                            .then(value => {
                                this.long.createRetentionPolicy('long', '156w', 1, null, true);
                            })
                            .catch(error => {
                                console.error(error)
                            })
                    }
                    InfluxDB.instance = this;

                })
                .catch(err => {
                    console.error(err);
                })
            
            return InfluxDB.instance;
        }
    }

    //return in which database save data depending on time interval
    chooseDatabase(timePeriodLength, timePeriodKey) {
        const timePeriodSecond = time.convertSecond(timePeriodLength, timePeriodKey);
        let databaseClient;

        if (timePeriodSecond <= maxTimeDatabase.hour12) {
            databaseClient = this.twentyFourHours;
        } else
            if (timePeriodSecond <= maxTimeDatabase.day3) {
                databaseClient = this.sixDays;
            } else
                if (timePeriodSecond <= maxTimeDatabase.week2) {
                    databaseClient = this.fourWeek;
                } else
                    if (timePeriodSecond <= maxTimeDatabase.week4) {
                        databaseClient = this.eightWeek;
                    } else
                        if (timePeriodSecond <= maxTimeDatabase.week8) {
                            databaseClient = this.sixteenWeek;
                        } else
                            if (timePeriodSecond <= maxTimeDatabase.week26) {
                                databaseClient = this.fiftyTwoWeek;
                            } else
                                if (timePeriodSecond <= maxTimeDatabase.week52) {
                                    databaseClient = this.oneHundredFour;
                                } else {
                                    databaseClient = this.long;
                                }

        return databaseClient;
    }

    //TODO
    async writeDeviceData(project, timeSeries, aggrFunName, aggrFunCode, timePeriodKey, timePeriodLength, granularityKey, granularityNumber) {
        const measurement = 'devicedata';
        const databaseClient = this.chooseDatabase(timePeriodLength, timePeriodKey);

        if (aggrFunCode === 0) {
            aggrFunCode = 1;
        } else
            if (aggrFunCode === 5) {
                aggrFunCode = 4;
            }

        //create writer
        for (let item of timeSeries) {

            let deviceName = '';
            let keywordName = '';
            for (device of item.device) {
                deviceName += device;
            }
            for (keyword of item.keyword) {
                keywordName += keyword;
            }


            for (let i = 0; i < item.timeSeries.length; i++) {

                databaseClient.write(measurement)
                    .tag({
                        aggregationFunctionCode: aggrFunCode,
                        aggregationFunctionName: aggrFunName,
                        device: deviceName,
                        granularityKey: granularityKey,
                        granularityNumber: granularityNumber,
                        keyword: keywordName,
                        project: project,
                        timePeriodKey: timePeriodKey,
                        timePeriodLength: timePeriodLength,
                    })
                    .field({
                        value: item.timeSeries[i].value,
                    })
                    .time(item.timeSeries[i].time, 's')
                    .queue()
            }
        }

        //write data

        databaseClient.syncWrite()
            .catch(err => console.error(`sync write queue fail, ${err.message}`));

    }

    //used to create reader object 
    createReaderQueryDeviceData(client, table, project, device, keyword, aggrFunName, aggrFunCode, timePeriodKey, timePeriodLength, granularityKey, granularityNumber, start, end) {
        let reader = client.query('request');
        reader.set({ 'format': 'json', 'epoch': 's' });
        reader.measurement = table;
        reader.addField('value');
        //time intervall
        reader.where('time', start, '>=');
        reader.where('time', end, '<=');
        //where condition
        reader.where('project', project);
        reader.where('device', device);
        reader.where('keyword', keyword);
        reader.where('aggregationFunctionName', aggrFunName);
        reader.where('aggregationFunctionCode', aggrFunCode);
        reader.where('timePeriodKey', timePeriodKey);
        reader.where('timePeriodLength', timePeriodLength);
        reader.where('granularityKey', granularityKey);
        reader.where('granularityNumber', granularityNumber);

        return reader;
    }

    async query(device, keyword, reader) {
        const promise = reader.then();
        let influxDbOffline = null;
        const result = await promise
            .then(data => {
                if (data.devicedata) {
                    return data.devicedata;
                } else {
                    return [];
                }
            })
            .catch((err) => {
                influxDbOffline = err;
                return [];
            });

        return { query: { device: device, keyword: keyword, timeSeries: result }, influxDbOffline };
    }

    async _createQueryDeviceDataResult(promises, granularityNumber, granularityKey){
        const result = await Promise.all(promises)
        .then(query => {
            let result = { query: [], error: false, timeSeriesStartAfterOnePeriod: 0, timeSeriesStart: 0};
            for (let item of query) {
                if (item.influxDbOffline) {
                    result.error = item.influxDbOffline;
                    break;
                }
                result.query.push(item.query);
                const queryLength = item.query.timeSeries.length;
                if (queryLength > 0) {
                    if (result.timeSeriesStartAfterOnePeriod === 0 || result.timeSeriesStartAfterOnePeriod > item.query.timeSeries[0].time){
                        result.timeSeriesStartAfterOnePeriod = item.query.timeSeries[0].time;
                    }
                }
            }

            if (result.timeSeriesStartAfterOnePeriod !== 0){
                result.timeSeriesStart = time.subtract(result.timeSeriesStartAfterOnePeriod,granularityNumber, granularityKey);
            }

            return result;
        });

        return result;
    }

    /**
     * Used to query database, For every device of devices and keyword of keywords:
     * SELECT value,singlePeriodLength FROM 'devicedata' WHERE
     * time >= start AND device=device AND keyword=keyword AND aggregationFunctionName=aggrFunName
     * AND aggregationFunctionCode=aggrFunCode AND timePeriodKey=timePeriodKey AND
     * timePeriodLength=timePeriodLength AND granularity=granularity
     * @param {number} start - timestamp in nanosecond which indicates the time from where start
     * @param {string} table
     * @param {string} measurement
     * @param {string} devices
     * @param {string} keywords
     * @param {string} aggrFunName
     * @param {string} aggrFunCode
     * @param {string} timePeriodKey
     * @param {string} timePeriodLength
     * @param {string} granularity
    */

    async queryDeviceData(project, devices, keywords, aggrFunName, aggrFunCode, timePeriodKey, timePeriodLength, granularityKey, granularityNumber, start, end) {
        const measurement = 'devicedata';
        const databaseClient = this.chooseDatabase(timePeriodLength, timePeriodKey);
        let promises = [];

        if (aggrFunCode <= 1) {
            for (let device of devices) {
                for (let keyword of keywords) {
                    const reader = this.createReaderQueryDeviceData(databaseClient, measurement, project, device, keyword, aggrFunName, '1', timePeriodKey, timePeriodLength, granularityKey, granularityNumber, start, end);
                    if (reader) {
                        promises.push(this.query([device], [keyword], reader));
                    }
                }
            }

            const result = this._createQueryDeviceDataResult(promises,granularityNumber, granularityKey);

            return result;
        }

        if (aggrFunCode == 2) {
            let keywordQuery = '';
            let keywordArray = [];
            for (let keyword of keywords) {
                keywordQuery += keyword;
                keywordArray.push(keyword);
            }

            for (let device of devices) {
                const reader = this.createReaderQueryDeviceData(databaseClient, measurement, project, device, keywordQuery, aggrFunName, aggrFunCode, timePeriodKey, timePeriodLength, granularityKey, granularityNumber, start, end);
                if (reader) {
                    promises.push(this.query([device], keywordArray, reader));
                }
            }
            const result = this._createQueryDeviceDataResult(promises,granularityNumber, granularityKey);

            return result;
        }

        if (aggrFunCode == 3) {
            let deviceQuery = '';
            let deviceArray = [];
            for (let device of devices) {
                deviceQuery += device;
                deviceArray.push(device);
            }

            for (let keyword of keywords) {
                const reader = this.createReaderQueryDeviceData(databaseClient, measurement, project, deviceQuery, keyword, aggrFunName, aggrFunCode, timePeriodKey, timePeriodLength, granularityKey, granularityNumber, start, end);
                if (reader) {
                    promises.push(this.query(deviceArray, [keyword], reader));
                }
            }

            const result = this._createQueryDeviceDataResult(promises,granularityNumber, granularityKey);

            return result;
        }

        if (aggrFunCode >= 4) {
            let deviceQuery = '';
            let deviceArray = [];
            let keywordQuery = '';
            let keywordArray = [];

            for (let device of devices) {
                deviceQuery += device;
                deviceArray.push(device);
            }
            for (let keyword of keywords) {
                keywordQuery += keyword;
                keywordArray.push(keyword);
            }
            const reader = this.createReaderQueryDeviceData(databaseClient, measurement, project, deviceQuery, keywordQuery, aggrFunName, '4', timePeriodKey, timePeriodLength, granularityKey, granularityNumber, start, end);
            if (reader) {
                promises.push(this.query(deviceArray, keywordArray, reader));
            }

            const result = this._createQueryDeviceDataResult(promises,granularityNumber, granularityKey);

            return result;
        }

    }

}

exports.InfluxDB = InfluxDB;
