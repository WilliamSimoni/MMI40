const { time } = require('../custom-modules/time');
const Influx = require('influxdb-nodejs');

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
            }

        } catch (err) {
            console.error(err);
            return false;
        }
        return true;
    }

    /**
     * return Time Series Database Client associated to key
     * @param {string} key 
     * @throws {Error} if key is not valid
     */

    GetTimeSeriesClient(key){
        let databaseClient;
        switch(key){
            case ('minute'): databaseClient = this.minute; break;
            case ('hour'): databaseClient = this.hour; break;
            case ('day'): databaseClient = this.day; break;
            case('week'): databaseClient = this.other; break;
            case('month'): databaseClient = this.other; break;
            case('year'): databaseClient = this.other; break;
        }

        if (!databaseClient){
            throw new Error('key not supported');
        }

        return databaseClient;
    }

    /**
     * insert standard data in the write queue for the database
     * @param {Object} databaseClient - databaseClient
     * @param {string} projectName - projectName
     * @param {string} fleet - fleet which sent data 
     * @param {string} tag - tag associated to data
     * @param {string} value - value associated to data
     * @param {number} data - numeric value
     * @param {boolean} isValid - if true data is valid, else is not valid
     * @param {string} aggregationFunction - aggregation function applied
     * @param {number} time - timestamp in second  
     * @throws {Error} 
     */

    queueStandardData(databaseClient, projectName, fleet, tag, value,  data, isValid, aggregationFunction, time){
        
        databaseClient.write('standard')
            .tag({
                aggregationFunction: aggregationFunction,
                fleet: fleet,
                projectName: projectName,
                tag: tag,
                unit: value,
            })
            .field({
                value: data,
                isValid: isValid
            })
            .time(time, 's')
            .queue();
    }

    /**
     * write data stored in queues
     * @param {Object} databaseClient 
     */
    async writeData(databaseClient){
        await databaseClient.syncWrite();
    }

    /**
     * 
     * @param {Object} databaseClient - databaseClient
     * @param {string} projectName - projectName
     * @param {string} fleet - fleet which sent data 
     * @param {string} tag - tag associated to data
     * @param {string} value - value associated to data
     * @param {string} aggregationFunction - aggregation function applied
     * @param {number} start - timestamp from which start in nanosecond
     * @param {number} end - timestamp from which end in nanosecond
     */
    async queryStandardData(databaseClient, projectName, fleet, tag, value, aggregationFunction, start, end){

        let reader = databaseClient.query('request');

        reader.set({ 'format': 'json', 'epoch': 's' });

        reader.measurement = measurement;

        reader.addField('value');
        reader.addField('isValid');
        
        //
        //time intervall
        //

        reader.where('time', start, '>=');
        reader.where('time', end, '<=');

        //
        //where condition
        //

        reader.where('projectName', projectName);
        reader.where('tag', tag);
        reader.where('unit', value);
        reader.where('fleet', fleet);
        reader.where('aggregationFunction', aggregationFunction);

        //
        // make database query
        //

        const query = await reader.then();

        return query;
    }
}

exports.InfluxDB = InfluxDB;
