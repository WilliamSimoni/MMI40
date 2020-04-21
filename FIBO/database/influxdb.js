const { time } = require('../FIBO_modules/time');
const Influx = require('influxdb-nodejs');

/*
CREATE CONTINUOUS QUERY to_hour_sum ON twentyFourHours RESAMPLE EVERY 30m BEGIN SELECT sum(value) INTO "fourWeek"."fourWeek"."aggregatedsum" FROM "twentyFourHours"."twentyFourHours"."aggregatedsum" GROUP BY time(1h),* END

CREATE CONTINUOUS QUERY to_hour_mean ON twentyFourHours RESAMPLE EVERY 30m BEGIN SELECT mean(value) INTO "fourWeek"."fourWeek"."aggregatedmean" FROM "twentyFourHours"."twentyFourHours"."aggregatedmean" GROUP B
Y time(1h), * END

CREATE CONTINUOUS QUERY to_hour_max ON twentyFourHours RESAMPLE EVERY 30m BEGIN SELECT max(value) INTO "fourWeek"."fourWeek"."aggregatedmax" FROM "twentyFourHours"."twentyFourHours"."aggregatedmax" GROUP BY ti
me(1h), * END

CREATE CONTINUOUS QUERY to_hour_min ON twentyFourHours RESAMPLE EVERY 30m BEGIN SELECT max(value) INTO "fourWeek"."fourWeek"."aggregatedmax" FROM "twentyFourHours"."twentyFourHours"."aggregatedmax" GROUP BY ti
me(1h), * END
*/

/*
CREATE CONTINUOUS QUERY to_day_max ON fourWeek RESAMPLE EVERY 12h BEGIN SELECT max(value) INTO "oneHundredFour"."oneHundredFour"."aggregatedmax" FROM "fourWeek"."fourWeek"."aggregatedmax" GROUP BY time(1d), * END

CREATE CONTINUOUS QUERY to_day_min ON fourWeek RESAMPLE EVERY 12h BEGIN SELECT min(value) INTO "oneHundredFour"."oneHundredFour"."aggregatedmin" FROM "fourWeek"."fourWeek"."aggregatedmin" GROUP BY time(1d), * END   

CREATE CONTINUOUS QUERY to_day_sum ON fourWeek RESAMPLE EVERY 12h BEGIN SELECT sum(value) INTO "oneHundredFour"."oneHundredFour"."aggregatedsum" FROM "fourWeek"."fourWeek"."aggregatedsum" GROUP BY time(1d), * END    

CREATE CONTINUOUS QUERY to_day_mean ON fourWeek RESAMPLE EVERY 12h BEGIN SELECT mean(value) INTO "oneHundredFour"."oneHundredFour"."aggregatedmean" FROM "fourWeek"."fourWeek"."aggregatedmean" GROUP BY time(1d), * END 
*/

//CREATE CONTINUOUS QUERY test ON twentyFourHours RESAMPLE EVERY 5m BEGIN SELECT sum(value) INTO fourWeek.fourWeek.aggregatedsum FROM twentyFourHours.twentyFourHours.aggregatedsum GROUP BY time(10m), * END



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
            this.host = process.env.INFLUXDBHOST;
            this.port = process.env.INFLUXDBPORT;
            //creating database clients, one database for every retention policy
            this.minute = new Influx(this.host + ':' + this.port + '/twentyFourHours');
            this.hour = new Influx(this.host + ':' + this.port + '/fourWeek');
            this.day = new Influx(this.host + ':' + this.port + '/oneHundredFour');
            this.other = new Influx(this.host + ':' + this.port + '/longPeriods');

            this.minute.showDatabases()
                .then(result => {


                    if (!result.includes('twentyFourHours')) {
                        this.minute.createDatabase()
                            .then(value => {
                                this.minute.createRetentionPolicy('twentyFourHours', '24h', 1, null, true);
                            })
                            .catch(error => {
                                console.error(error)
                            })
                    }

                    if (!result.includes('fourWeek')) {
                        this.hour.createDatabase()
                            .then(value => {
                                this.hour.createRetentionPolicy('fourWeek', '4w', 1, null, true);
                            })
                            .catch(error => {
                                console.error(error)
                            })
                    }

                    if (!result.includes('oneHundredFour')) {
                        this.day.createDatabase()
                            .then(value => {
                                this.day.createRetentionPolicy('oneHundredFour', '104w', 1, null, true);
                            })
                            .catch(error => {
                                console.error(error)
                            })
                    }
                    
                    if (!result.includes('longPeriods')) {
                        this.other.createDatabase()
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
/*
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
*/
    async writeDeviceData(project, timeSeries, aggregationFunction, timePeriodKey, timePeriodLength, granularityKey, granularityNumber) {
        const measurement = 'devicedata';
        const databaseClient = this.chooseDatabase(timePeriodLength, timePeriodKey);

        //create writer
        for (let item of timeSeries) {

            let queryTag = '';

            for (let tag of item.tags) {
                queryTag += tag.replace(/\s+/g, '');
            }

            for (let i = 0; i < item.timeSeries.length; i++) {
                databaseClient.write(measurement)
                    .tag({
                        aggregationFunction: aggregationFunction,
                        granularityKey: granularityKey,
                        granularityNumber: granularityNumber,
                        project: project,
                        tags: queryTag,
                        timePeriodKey: timePeriodKey,
                        timePeriodLength: timePeriodLength,
                        unit: item.value,
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

    //QUERY DEVICEDATA

    //used to create reader object 
    createReaderQueryDeviceData(client, table, project, tags, value, aggrFun, timePeriodKey, timePeriodLength, granularityKey, granularityNumber, start, end) {
        let reader = client.query('request');
        reader.set({ 'format': 'json', 'epoch': 's' });
        reader.measurement = table;
        reader.addField('value');
        //time intervall
        reader.where('time', start, '>=');
        reader.where('time', end, '<=');
        //where condition
        reader.where('project', project);
        reader.where('tags', tags);
        reader.where('unit', value);
        reader.where('aggregationFunction', aggrFun);
        reader.where('timePeriodKey', timePeriodKey);
        reader.where('timePeriodLength', timePeriodLength);
        reader.where('granularityKey', granularityKey);
        reader.where('granularityNumber', granularityNumber);

        return reader;
    }

    async query(tags, value, reader) {
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

        return { query: { tags, value, timeSeries: result }, influxDbOffline };
    }

    async _createQueryDeviceDataResult(promises, granularityNumber, granularityKey) {
        const result = await Promise.all(promises)
            .then(query => {
                let result = { query: [], error: false, timeSeriesStartAfterOnePeriod: 0, timeSeriesStart: 0 };
                for (let item of query) {
                    if (item.influxDbOffline) {
                        result.error = item.influxDbOffline;
                        break;
                    }
                    result.query.push(item.query);
                    const queryLength = item.query.timeSeries.length;
                    if (queryLength > 0) {
                        if (result.timeSeriesStartAfterOnePeriod === 0 || result.timeSeriesStartAfterOnePeriod > item.query.timeSeries[0].time) {
                            result.timeSeriesStartAfterOnePeriod = item.query.timeSeries[0].time;
                        }
                    }
                }

                if (result.timeSeriesStartAfterOnePeriod !== 0) {
                    result.timeSeriesStart = time.subtract(result.timeSeriesStartAfterOnePeriod, granularityNumber, granularityKey) + 1;
                }

                return result;
            });

        return result;
    }

    async queryDeviceData(project, tags, values, aggrFun, timePeriodKey, timePeriodLength, granularityKey, granularityNumber, start, end) {
        const measurement = 'devicedata';
        const databaseClient = this.chooseDatabase(timePeriodLength, timePeriodKey);
        let promises = [];

        for (let tag of tags) {

            let queryTag = '';

            for (let item of tag) {
                queryTag += item.replace(/\s+/g, '');
            }

            for (let value of values) {
                const reader = this.createReaderQueryDeviceData(databaseClient, measurement, project, queryTag, value, aggrFun, timePeriodKey, timePeriodLength, granularityKey, granularityNumber, start, end);
                if (reader) {
                    promises.push(this.query(tag, value, reader));
                }
            }
        }

        const result = this._createQueryDeviceDataResult(promises, granularityNumber, granularityKey);

        return result;

    }

    //QUERY AND WRITE LIVEDATA AND AGGREGATED MEASUREMENT
    async insertAggregated(project, tags, fleet, aggrFun, units, database) {

        let databaseClient;
        switch(database){
            case 'minute': databaseClient = this.minute; break;
            case 'hour': databaseClient = this.hour; break;
            case 'day': databaseClient = this.day; break;
            default: databaseClient = this.other; break;
        }
    

        if (!databaseClient){
            throw new Error('database does not exist');
        }

        const measurement = 'aggregated' + aggrFun;

        let queryTag = '';

        for (let tag of tags) {
            queryTag += tag.replace(/\s+/g, '');
        }

        for (let unit in units){
                databaseClient.write(measurement)
                    .tag({
                        project: project,
                        tags: queryTag,
                        fleet: fleet,
                        unit: unit
                    })
                    .field({
                        value: units[unit]
                    })
                    .queue()
        }

    databaseClient.syncWrite()
            .then(res => console.log(project,queryTag,fleet,aggrFun,units))
            .catch(err => console.error(`sync write queue fail, ${err.message}`));

    }

async searchAggregated(project, tags, unit, fleet, aggrFun, start, end, database) {

    let databaseClient;
    switch(database){
        case 'minute': databaseClient = this.minute; break;
        case 'hour': databaseClient = this.hour; break;
        case 'day': databaseClient = this.day; break;
        default: databaseClient = this.other; break;
    }

    const measurement = 'aggregated' + aggrFun;

    if (!databaseClient){
        throw new Error('database does not exist');
    }

    let queryTag = '';

    for (let tag of tags) {
        queryTag += tag.replace(/\s+/g, '');
    }

    let reader = databaseClient.query('request');
    reader.set({ 'format': 'json', 'epoch': 's' });
    reader.measurement = measurement;
    reader.addField('value');
    //time intervall
    reader.where('time', start, '>=');
    reader.where('time', end, '<=');
    //where condition
    reader.where('project', project);
    reader.where('tags', queryTag);
    reader.where('unit', unit);
    reader.where('fleet', fleet);

    try {
        if (reader) {
            const query = await reader.then();
            return query;
        }
    } catch (err) {
    }

    
    return {};
}


}

exports.InfluxDB = InfluxDB;
