//setting environment variables with dotenv
require('dotenv').config({ path: __dirname + '/../../.env' });
const redis = require("redis");

const pubsub = require('../pubsub/pubsub');

const REDISHOST = process.env.REDISHOST || 'localhost';
const REDISPORT = process.env.REDISPORT || 6379;

pubsub.client(REDISHOST,REDISPORT).then(
    res => {
        res.publish('flt-4uriyjhshark', JSON.stringify({tag:'kitchen', value:'temp', device:'kitchen', fleet:'flt-4uriyjhshark', timestamp: Date.now(), threshold: 50, faultValue: 56}));
    }
)
 