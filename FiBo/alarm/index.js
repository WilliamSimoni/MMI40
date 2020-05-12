//setting environment variables with dotenv
require('dotenv').config({ path: __dirname + '/./../.env' });

//env variables
const REDISHOST = process.env.REDISHOST || 'localhost';
const REDISPORT = process.env.REDISPORT || 6379;

const PORT = process.env.ALARM_MAIN_PORT || 7779;

const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const pubsub = require('./pubsub/pubsub');
let jwt = require('jsonwebtoken');

//CORS middleware

const cors = require('cors');
app.use(cors());
app.options('*', cors());

const JWT_KEY = process.env.JWT_KEY;

//array of object, each object is defined as follow: {fleetId, counter} where counter is the number of client connected for that fleet
let fleetCounter = {};

pubsub.client(REDISHOST, REDISPORT)
  .then(res => {

    http.listen(PORT, function () {
      console.log('listening on ' + PORT);
    });

    io.use(async (socket, next) => {
      if (!socket.handshake.query) {
        return next(new Error('Authentication error'));
      }

      const token = socket.handshake.query.token;

      if (token) {

        jwt.verify(token, JWT_KEY, async (err, decoded) => {

          //TODO BLACKLIST

          if (err) return next(new Error('Authentication error'));
          socket.decoded = decoded;
          next();

        });

      } else {

        next(new Error('Authentication error'));

      }

    });

    io.use()

    const alarm = io.of('/alarm');

    alarm.on('connection', socket => {

      console.log('connected');


      //list of fleetId required by client
      let userFleets = [];

      socket.on('addFleet', async (fleetId) => {
        try {

          if (!fleetCounter[fleetId]) {

            res.subscribe(fleetId);
            fleetCounter[fleetId] = 1

          } else {

            fleetCounter[fleetId]++;

          }

          userFleets.push(fleetId);

          //adding client to room for that fleet

          socket.join(fleetId);

          console.log(socket.rooms);


        } catch (err) {
          console.error(err);
          socket.disconnect(true);
        }
      });

      socket.on('rmFleet', async (fleetId) => {
        try {

          const userFleetsIndex = fleetId.indexOf(fleetId);

          if (fleetCounter[fleetId] && userFleetsIndex !== -1) {

            fleetCounter[fleetId]--;

            if (fleetCounter[fleetId] === 0) {
              res.unsubscribe(fleetId);
              delete fleetCounter[fleetId];
            }

            socket.leave(fleetId);

          }

        } catch (err) {
          console.error(err);
          socket.disconnect(true);
        }
      });

      socket.on('disconnect', function () {

        for (let fleetId of userFleets) {

          fleetCounter[fleetId]--;

          if (fleetCounter[fleetId] === 0) {

            res.unsubscribe(fleetId);
            delete fleetCounter[fleetId];

          }

        }

        console.log(fleetCounter, userFleets);

        console.log('A user disconnected');
      });

    });

    res.on("message", (channel, message) => {
      console.log(message, channel);
      io.of('alarm').to(channel).emit('alarm', message);
    })

  })
  .catch(err => console.error(err));