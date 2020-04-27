

const redis = require("redis");
const promise = require("bluebird");

promise.promisifyAll(redis.RedisClient.prototype);
promise.promisifyAll(redis.Multi.prototype);

let client = (host, port) => {
    return new Promise((resolve, reject) => {
        let connector = redis.createClient({host, port});

        connector.on("error", () => {
            reject("Redis Connection failed");
        });

        connector.on("connect", () => {
            resolve(connector);
        });
    });
};

let publishAlarm = (alarm, fleet) => {
    return new Promise((resolve, reject) => {
        client().then(
            res => {
                res
                    .multi()
                    .publish(fleet,JSON.stringify(alarm))
                    .execAsync()
                    .then(
                        res => {
                            resolve(res);
                        },
                        err => {
                            reject(err);
                        }
                    );
            },
            err => {
                reject("Redis connection failed: " + err);
            }
        );
    });
};

exports.client = client;
exports.publishAlarm = publishAlarm;