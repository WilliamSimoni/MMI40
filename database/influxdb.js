const { time } = require('../custom-modules/time');
const Influx = require('influxdb-nodejs');

/*
CREATE CONTINUOUS QUERY to_hour_sum ON twentyFourHours RESAMPLE EVERY 30m BEGIN SELECT sum(value) INTO "fiveWeek"."fiveWeek"."aggregatedsum" FROM "twentyFourHours"."twentyFourHours"."aggregatedsum" GROUP BY time(1h),* END

CREATE CONTINUOUS QUERY to_hour_mean ON twentyFourHours RESAMPLE EVERY 30m BEGIN SELECT mean(value) INTO "fiveWeek"."fiveWeek"."aggregatedmean" FROM "twentyFourHours"."twentyFourHours"."aggregatedmean" GROUP B
Y time(1h), * END

CREATE CONTINUOUS QUERY to_hour_max ON twentyFourHours RESAMPLE EVERY 30m BEGIN SELECT max(value) INTO "fiveWeek"."fiveWeek"."aggregatedmax" FROM "twentyFourHours"."twentyFourHours"."aggregatedmax" GROUP BY ti
me(1h), * END

CREATE CONTINUOUS QUERY to_hour_min ON twentyFourHours RESAMPLE EVERY 30m BEGIN SELECT max(value) INTO "fiveWeek"."fiveWeek"."aggregatedmax" FROM "twentyFourHours"."twentyFourHours"."aggregatedmax" GROUP BY ti
me(1h), * END
*/

/*
CREATE CONTINUOUS QUERY to_day_max ON fiveWeek RESAMPLE EVERY 12h BEGIN SELECT max(value) INTO "fourYears"."fourYears"."aggregatedmax" FROM "fiveWeek"."fiveWeek"."aggregatedmax" GROUP BY time(1d), * END

CREATE CONTINUOUS QUERY to_day_min ON fiveWeek RESAMPLE EVERY 12h BEGIN SELECT min(value) INTO "fourYears"."fourYears"."aggregatedmin" FROM "fiveWeek"."fiveWeek"."aggregatedmin" GROUP BY time(1d), * END   

CREATE CONTINUOUS QUERY to_day_sum ON fiveWeek RESAMPLE EVERY 12h BEGIN SELECT sum(value) INTO "fourYears"."fourYears"."aggregatedsum" FROM "fiveWeek"."fiveWeek"."aggregatedsum" GROUP BY time(1d), * END    

CREATE CONTINUOUS QUERY to_day_mean ON fiveWeek RESAMPLE EVERY 12h BEGIN SELECT mean(value) INTO "fourYears"."fourYears"."aggregatedmean" FROM "fiveWeek"."fiveWeek"."aggregatedmean" GROUP BY time(1d), * END 
*/

//CREATE CONTINUOUS QUERY test ON twentyFourHours RESAMPLE EVERY 5m BEGIN SELECT sum(value) INTO fourWeek.fourWeek.aggregatedsum FROM twentyFourHours.twentyFourHours.aggregatedsum GROUP BY time(10m), * END



class InfluxDB {
    /**
     * create influxDB clients to comunicate with timeSerieDatabase
     */
    constructor() {
        if (!InfluxDB.instance) {
            this.host = process.env.INFLUXDBHOST;
            this.port = process.env.INFLUXDBPORT;
            //creating database clients, one database for every retention policy
            this.minute = new Influx(this.host + ':' + this.port + '/twentyFourHours');     //where store data in minute
            this.hour = new Influx(this.host + ':' + this.port + '/fiveWeek');              //where store data in hour
            this.day = new Influx(this.host + ':' + this.port + '/fourYears');              //where store data in day
            this.other = new Influx(this.host + ':' + this.port + '/longPeriods');          //where store data in longer period than day
            InfluxDB.instance = this;
        }

        return InfluxDB.instance;
    }

    /**
     * Initialize Time Series Database
     */
    async createTimeSeriesDatabase() {
        try {
            const databases = await this.minute.showDatabases();

            if (!databases) {
                return false;
            }

            if (!databases.includes('longPeriods')) {
                await this.other.createDatabase();
            }

            if (!databases.includes('fourYears')) {
                await this.day.createDatabase();
                await this.day.createRetentionPolicy('fourYears', '208w', 1, null, true);
            }

            if (!databases.includes('fiveWeek')) {
                await this.hour.createDatabase();
                await this.hour.createRetentionPolicy('fiveWeek', '5w', 1, null, true);
            }

            if (!databases.includes('twentyFourHours')) {
                await this.minute.createDatabase();
                await this.minute.createRetentionPolicy('twentyFourHours', '25h', 1, null, true);
                await this.minute.queryRaw('CREATE CONTINUOUS QUERY to_hour_sum ON twentyFourHours RESAMPLE EVERY 30m BEGIN SELECT sum(value) INTO "fiveWeek"."fiveWeek"."aggregatedsum" FROM "twentyFourHours"."twentyFourHours"."aggregatedsum" GROUP BY time(1h),* END', 'twentyFourHours');
                await this.minute.queryRaw('CREATE CONTINUOUS QUERY to_hour_mean ON twentyFourHours RESAMPLE EVERY 30m BEGIN SELECT mean(value) INTO "fiveWeek"."fiveWeek"."aggregatedmean" FROM "twentyFourHours"."twentyFourHours"."aggregatedmean" GROUP BY time(1h), * END', 'twentyFourHours');
                await this.minute.queryRaw('CREATE CONTINUOUS QUERY to_hour_max ON twentyFourHours RESAMPLE EVERY 30m BEGIN SELECT max(value) INTO "fiveWeek"."fiveWeek"."aggregatedmax" FROM "twentyFourHours"."twentyFourHours"."aggregatedmax" GROUP BY time(1h), * END', 'twentyFourHours');
                await this.minute.queryRaw('CREATE CONTINUOUS QUERY to_hour_min ON twentyFourHours RESAMPLE EVERY 30m BEGIN SELECT min(value) INTO "fiveWeek"."fiveWeek"."aggregatedmin" FROM "twentyFourHours"."twentyFourHours"."aggregatedmin" GROUP BY time(1h), * END', 'twentyFourHours');
            }

        } catch (err) {
            console.error(err);
            return false;
        }
        return true;
    }

    addWriteQueueAggregated(measurement, project, fleet, timeSeries, isInvalid, databaseClient) {
        for (let moment of timeSeries.timeSeries) {
            databaseClient.write(measurement)
                .tag({
                    project: project,
                    tags: this.createQueryTag(timeSeries.tags),
                    fleet: fleet,
                    unit: timeSeries.value
                })
                .field({
                    value: moment.value,
                    invalid: isInvalid
                })
                .time(moment.time, 's')
                .queue()
        }
    }

    addWriteQueueParticular(measurement, project, fleet, aggrFun, granularityKey, granularityNumber, timeSeries, isInvalid, databaseClient) {
        for (let moment of timeSeries.timeSeries) {
            databaseClient.write(measurement)
                .tag({
                    project: project,
                    tags: this.createQueryTag(timeSeries.tags),
                    fleet: fleet,
                    unit: timeSeries.value,
                    aggrFun: aggrFun,
                    granularityKey: granularityKey,
                    granularityNumber: granularityNumber
                })
                .field({
                    value: moment.value,
                    invalid: isInvalid
                })
                .time(moment.time, 's')
                .queue()
        }
    }

    createQueryTag(tags) {
        let queryTag = '';
        for (let tag of tags) {
            queryTag += tag.replace(/\s+/g, '');
        }
        return queryTag;
    }

    async insertDeviceData(project, timeSeriesAggregated, timeSeriesParticular, invalidAggregated, invalidParticular, fleet, granularityKey, granularityNumber, aggrFun) {
        let databaseClient;
        switch (granularityKey) {
            case 'second': databaseClient = this.minute; break;
            case 'minute': databaseClient = this.minute; break;
            case 'hour': databaseClient = this.hour; break;
            case 'day': databaseClient = this.day; break;
            default: databaseClient = this.other; break;
        }

        if (!databaseClient) {
            throw new Error('database does not exist');
        }

        const measurementAggregated = 'aggregated' + aggrFun;

        for (let item of timeSeriesAggregated) {
            console.log(item);
            this.addWriteQueueAggregated(measurementAggregated, project, fleet, item, false, databaseClient);
        }

        for (let item of invalidAggregated) {
            this.addWriteQueueAggregated(measurementAggregated, project, fleet, item, true, databaseClient);
        }

        for (let item of timeSeriesParticular) {
            this.addWriteQueueParticular('particular', project, fleet, aggrFun, granularityKey, granularityNumber, item, false, databaseClient);
        }

        for (let item of invalidParticular) {
            this.addWriteQueueParticular('particular', project, fleet, aggrFun, granularityKey, granularityNumber, item, true, databaseClient);
        }

        databaseClient.syncWrite()
            .then(res => console.log('success'))
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

    async searchDeviceData(project, tags, values, aggrFun, timePeriodKey, timePeriodLength, granularityKey, granularityNumber, start, end) {
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
        switch (database) {
            case 'minute': databaseClient = this.minute; break;
            case 'hour': databaseClient = this.hour; break;
            case 'day': databaseClient = this.day; break;
            default: databaseClient = this.other; break;
        }


        if (!databaseClient) {
            throw new Error('database does not exist');
        }

        const measurement = 'aggregated' + aggrFun;

        let queryTag = '';

        for (let tag of tags) {
            queryTag += tag.replace(/\s+/g, '');
        }

        for (let unit in units) {
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
            .then(res => console.log(project, queryTag, fleet, aggrFun, units))
            .catch(err => console.error(`sync write queue fail, ${err.message}`));

    }

    async searchAggregated(project, tags, unit, fleet, aggrFun, start, end, database) {

        let databaseClient;
        switch (database) {
            case 'minute': databaseClient = this.minute; break;
            case 'hour': databaseClient = this.hour; break;
            case 'day': databaseClient = this.day; break;
            default: databaseClient = this.other; break;
        }

        const measurement = 'aggregated' + aggrFun;

        if (!databaseClient) {
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
