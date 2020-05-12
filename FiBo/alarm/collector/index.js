
//setting environment variables with dotenv
require('dotenv').config({ path: __dirname + '/../../.env' });

const pubsub = require('../pubsub/pubsub');

const REDISHOST = process.env.REDISHOST || 'localhost';
const REDISPORT = process.env.REDISPORT || 6379;

const { delay } = require('../../custom-modules/delay')

//
// create three connection with database
//

async function init() {
    const subscriber = await pubsub.client(REDISHOST, REDISPORT);
    const publisher = await pubsub.client(REDISHOST, REDISPORT);
    const standard = await pubsub.client(REDISHOST, REDISPORT);
    return { subscriber, publisher, standard };
}

function quit(subscriber, publisher, standard) {
    subscriber.quit();
    publisher.quit();
    standard.quit();
}

init()
    .then(async clients => {
        
        await findId(clients.subscriber, clients.publisher, clients.standard);

        subscriber.on('message', (channel, message) => {
            console.log(message);
        })

        quit(clients.subscriber, clients.publisher, clients.standard);

    }).catch(err => console.error(err));

async function findId(subscriber, publisher) {
    
    const DELAY_TIME = 2000;
    //
    // send presentation id to other processes
    //

    publisher.publish('presentation', 1);

    //
    //check if someone is already online
    //

    subscriber.subscribe('presentation');

    subscriber.on('message', (channel, message) => {
        console.log(message);
    })

    //
    // wait for other processes response
    //

    await delay(DELAY_TIME);
}