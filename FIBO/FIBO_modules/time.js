const moment = require('moment');

const timeConverter = {
    /**
 * Convert in second
 * @param {number} total - timestamp to be changed
 * @param {string} key - unit of time ('second', 'minute', 'hour', 'day, 'month', 'year')
 */

    convertSecond(total, key) {
        switch (key) {
            case ('second'): return total;
            case ('minute'): return total * 60;
            case ('hour'): return total * 3600;
            case ('day'): return total * 86400;
            case ('week'): return total * 604800;
            case ('month'): return total * 2629743;
            case ('year'): return total * 31556926;
            default: return -1;
        }
    },

    /**
 * Convert in minute
 * @param {number} total - timestamp to be changed
 * @param {string} key - unit of time ('second', 'minute', 'hour', 'day, 'month', 'year')
 */

    convertMinute(total, key) {
        switch (key) {
            case ('s'): return -1;
            case ('m'): return total;
            case ('h'): return total * 60;
            case ('d'): return total * 1440;
            case ('w'): return total * 10080;
            case ('M'): return total * 43200;
            case ('y'): return total * 518400;
            default: return -1;
        }
    },

    /**
* Convert in hour
* @param {number} total - timestamp to be changed
* @param {string} key - unit of time ('second', 'minute', 'hour', 'day, 'month', 'year')
*/

    convertHour(total, key) {
        switch (key) {
            case ('s'): return -1;
            case ('m'): return -1;
            case ('h'): return total;
            case ('d'): return total * 24;
            case ('w'): return total * 168;
            case ('M'): return total * 720;
            case ('y'): return total * 8640;
            default: return -1;
        }
    },

    /**
* Convert in minute
* @param {number} total - timestamp to be changed
* @param {string} key - unit of time ('second', 'minute', 'hour', 'day, 'month', 'year')
*/

    convertDay(total, key) {
        switch (key) {
            case ('s'): return -1;
            case ('m'): return -1;
            case ('h'): return -1;
            case ('d'): return total;
            case ('w'): return total * 7;
            case ('M'): return total * 30;
            case ('y'): return total * 365;
            default: return -1;
        }
    },

    /**
* Convert in week
* @param {number} total - timestamp to be changed
* @param {string} key - unit of time ('second', 'minute', 'hour', 'day, 'month', 'year')
*/

    convertWeek(total, key) {
        switch (key) {
            case ('s'): return -1;
            case ('m'): return -1;
            case ('h'): return -1;
            case ('d'): return -1;
            case ('w'): return total;
            case ('M'): return total * 4;
            case ('y'): return total * 52;
            default: return -1;
        }
    },

    /**
* Convert in month
* @param {number} total - timestamp to be changed
* @param {string} key - unit of time ('second', 'minute', 'hour', 'day, 'month', 'year')
*/

    convertMonth(total, key) {
        switch (key) {
            case ('s'): return -1;
            case ('m'): return -1;
            case ('h'): return -1;
            case ('d'): return -1;
            case ('w'): return -1;
            case ('M'): return total;
            case ('y'): return total * 12;
            default: return -1;
        }
    },

    /**
* Convert in year
* @param {number} total - timestamp to be changed
* @param {string} key - unit of time ('second', 'minute', 'hour', 'day, 'month', 'year')
*/

    convertYear(total, key) {
        switch (key) {
            case ('s'): return -1;
            case ('m'): return -1;
            case ('h'): return -1;
            case ('d'): return -1;
            case ('w'): return -1;
            case ('M'): return -1;
            case ('y'): return total;
            default: return -1;
        }
    }
}

const keyEnumeration = {
    'second': 0,
    'minute': 1,
    'hour': 2,
    'day': 3,
    'week': 4,
    'month': 5,
    'year': 6
}

const time = {

    /**
     * Return Current Date and Time in timestamp in UTC timezone
     */
    now() {
        return moment.utc().unix();
    },

    /**
     * Mutates the timestamp by subtracting time.
     * @param {number} timestamp - moment from which to subtract
     * @param {number} number
     * @param {string} key - unit of time ('second', 'minute', 'hour', 'day, 'month', 'year')
     */

    subtract(timestamp, number, key) {
        return moment.unix(timestamp).utc().subtract(number, key).unix();
    },

    /**
     * Mutates the timestamp by adding time.
     * @param {number} timestamp - moment from which to subtract
     * @param {number} number
     * @param {string} key - unit of time ('second', 'minute', 'hour', 'day, 'month', 'year')
     */

    add(timestamp, number, key) {
        return moment.unix(timestamp).utc().add(number, key).unix();
    },

    /**
     * Mutates the timestamp by setting it to the start of a unit of time.
     * @param {number} timestamp - timestamp to be changed
     * @param {string} key - unit of time ('second', 'minute', 'hour', 'day, 'month', 'year')
     */

    round(timestamp, key) {
        return moment.unix(timestamp).utc().startOf(key).unix();
    },

    /**
     * Mutates the timestamp by adding time and rounding to the nearest moment to end
     * @param {number} start - moment from which start
     * @param {number} number
     * @param {string} key - unit of time ('second', 'minute', 'hour', 'day, 'month', 'year')
     * @param {number} start - moment from which end
     */

    nearestMoment(start, number, key, end) {
        let startMoment = start;
        while (startMoment <= end) {
            startMoment = this.add(startMoment, number, key);
        }
        return startMoment;
    },

    createPeriods(start, number, key, end) {
        let moment = start;
        let timestamps = [];
        while (moment < end) {
            timestamps.push(moment);
            moment = this.add(moment, number, key);
        }
        return timestamps;
    }
}

const rounder = {

    /**
     * Return following rules written in FIBO doc
     * @param {number} number - number in second
     */
    roundPerGranularity(number) {
        if (number < 1) return 'second';
        if (number < 60) return 'minute';
        if (number < 3600) return 'hour';
        if (number < 604800) return 'day';
        if (number < 2419200) return 'month';
        return 'year';
    },

    /**
     * Depending on how far is moment from now, returns a keyword which indicates how to round timeSeriesStart
     * @param {number} number - moment 
     * @param {number} moment - now
     */
    roundPerTimePeriod(now, moment) {
        const length = now - moment;
        if (length < 7200) return 'second';     //2 hour
        if (length < 86400) return 'minute';    //24 hour
        if (length < 2419200) return 'hour';    //28 days
        return 'day';
    },

    /**
     * rounds time identified by <number,key> by rounding factor
     * @param {number} number - moment 
     * @param {string} key- key
     * @param {string} factor - rounding factor, values admitted:('second', 'minute', 'hour', 'day, 'month', 'year')
     */
    roundGranularity(number, key, factor) {
        let roundedNumber;
        const inSecond = timeConverter.convertSecond(number,key);
        switch (factor) {
            case 'second': roundedNumber = number; break;
            case 'minute': roundedNumber = inSecond/60; break;
            case 'hour': roundedNumber = inSecond/3600; break;
            case 'day': roundedNumber = inSecond/86400; break;
            case 'week': roundedNumber = inSecond/604800; break;
            case 'month': roundedNumber = inSecond/2629743; break;
            case 'year': roundedNumber = inSecond/31556926; break;
        }

        if (roundedNumber < 1) {
            roundedNumber = 1;
        } else {
            roundedNumber = Math.round(roundedNumber);
        }

        return { number: roundedNumber, key: factor }
    }
}

exports.time = time;
exports.rounder = rounder;
exports.timeConverter = timeConverter;
exports.keyEnumeration = keyEnumeration;