const { time } = require('./time');
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

class Database {
    /**
     * create influxDB clients and creates databases if it does not exist yet
     * */
    constructor() {
        if (!Database.instance) {

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

                })
                .catch(err => {
                    console.error(err);
                })
            Database.instance = this;
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
    writeDeviceData(project, devices, keywords, aggrFunName, aggrFunCode, timePeriodKey, timePeriodLength, granularityKey, granularityNumber, start) {
        const measurement = 'devicedata';
        const databaseClient = this.chooseDatabase(timePeriodLength, timePeriodKey);


    }

    //used to create reader object 
    createReaderQueryDeviceData(client, table, project, device, keyword, aggrFunName, aggrFunCode, timePeriodKey, timePeriodLength, granularityKey, granularityNumber, start) {
        let reader = client.query('request');
        reader.set({ 'format': 'json', 'epoch': 's' });
        reader.measurement = table;
        reader.addField('value', 'device');

        //time intervall
        reader.where('time', start, '>=');
        console.log(project);
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

    async queryDeviceData(project, devices, keywords, aggrFunName, aggrFunCode, timePeriodKey, timePeriodLength, granularityKey, granularityNumber, start) {
        const measurement = 'devicedata';
        const databaseClient = this.chooseDatabase(timePeriodLength, timePeriodKey);
        let statement = [];

        if (aggrFunCode <= 1) {
            for (let device of devices) {
                for (let keyword of keywords) {
                    device = device.replace(/\W+/g, '');
                    keyword = keyword.replace(/\W+/g, '');
                    const reader = this.createReaderQueryDeviceData(databaseClient, measurement, project, device, keyword, aggrFunName, '0', timePeriodKey, timePeriodLength, granularityKey, granularityNumber, start);
                    if (reader){
                        reader.queue();
                        statement.push({device: device, keyword: keyword});
                    }
                }
            }
            const result = await databaseClient.syncQuery();
            return {result, statement};
        }

        if (aggrFunCode == 2) {
            let keywordQuery = '';
            for (let keyword of keywords) {
                keyword = keyword.replace(/\W+/g, '');
                keywordQuery += keyword;
            }
            for (let device of devices) {
                device = device.replace(/\W+/g, '');
                const reader = this.createReaderQueryDeviceData(databaseClient, measurement, project, device, keywordQuery, aggrFunName, aggrFunCode, timePeriodKey, timePeriodLength, granularityKey, granularityNumber, start);
                if (reader){
                    reader.queue();
                    statement.push({device: device, keyword: keywordQuery});
                }
            }
            const result = await databaseClient.syncQuery();
            return {result, statement};
        }

        if (aggrFunCode == 3) {
            let deviceQuery = '';
            for (let device of devices) {
                device = device.replace(/\W+/g, '');
                deviceQuery += device;
            }

            for (let keyword of keywords) {
                keyword = keyword.replace(/\W+/g, '');
                const reader = this.createReaderQueryDeviceData(databaseClient, measurement, project, deviceQuery, keyword, aggrFunName, aggrFunCode, timePeriodKey, timePeriodLength, granularityKey, granularityNumber, start);
                if (reader){
                    reader.queue();
                    statement.push({device: deviceQuery, keyword: keyword});
                }
            }
            const result = await databaseClient.syncQuery();
            return {result, statement};
        }

        if (aggrFunCode >= 4) {
            let deviceQuery = '';
            let keywordQuery = '';
            for (let device of devices) {
                for (let keyword of keywords) {
                    device = device.replace(/\W+/g, '');
                    keyword = keyword.replace(/\W+/g, '');
                    deviceQuery += device;
                    keywordQuery += keyword;
                }
            }
            const reader = this.createReaderQueryDeviceData(databaseClient, measurement, project, deviceQuery, keywordQuery, aggrFunName, 1, timePeriodKey, timePeriodLength, granularityKey, granularityNumber, start);
            if (reader){
                reader.queue();
                statement.push({device: deviceQuery, keyword: keywordQuery});
            }
            const result = await databaseClient.syncQuery();
            return {result, statement};
        }

        return {result:{results:[]}, statement:{}};
    }

}

exports.Database = Database;