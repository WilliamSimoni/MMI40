const moment = require('moment');

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
     * Convert in second
     * @param {number} total - timestamp to be changed
     * @param {string} key - unit of time ('second', 'minute', 'hour', 'day, 'month', 'year')
     */

    convertSecond(total,key){
        switch(key){
            case ('second'): return total;
            case ('minute'): return total*60;
            case ('hour'): return total*3600;
            case ('day'): return total*86400;
            case ('week'): return total*604800;
            case ('month'): return total*2629743;
            case ('year'): return total*31556926;
            default: return -1;
        }
    },

    /**
     * Mutates the timestamp by adding time and rounding to the nearest moment to end
     * @param {number} start - moment from which start
     * @param {number} number
     * @param {string} key - unit of time ('second', 'minute', 'hour', 'day, 'month', 'year')
     * @param {number} start - moment from which end
     */

    nearestMoment(start, number, key, end){
        let startMoment = start;
        while(startMoment <= end){
            startMoment = this.add(startMoment, number, key);
        }
        return this.subtract(startMoment, number, key);
    }
}

const rounder = {

    roundGran1(number){
        if (number < 60) return 'second';
        if (number < 3600) return 'minute';
        return 'hour';
    },

    /**
     * Return following rules written in FIBO doc
     * @param {number} number - number in second
     */
    roundGran2(number) {
        if (number < 1) return 'second';
        if (number < 60) return 'minute';
        if (number < 3600) return 'hour';
        if (number < 604800) return 'day';      //7 giorni
        if (number < 16934400) return 'month';    //28 giorni
        return 'year';
    }
}

exports.time = time;
exports.rounder = rounder;