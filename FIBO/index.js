//setting environment variables with dotenv
require('dotenv').config();
const PORT = process.env.PORT || 7777;

const { SanitizerError } = require(`./Error_Class/SanitizerError`);

//FIBO routes
const {login} = require('./routers/login');
const {logout} = require('./routers/logout');
const {get} = require('./routers/get');

//Authorization middleware
const auth = require('./middleware/auth')

//Creating Database
//const database = new Database();

//For handling time mutations
const { time, rounder } = require(`./FIBO_modules/time`);

var compression = require('compression');
const express = require('express');

const app = express();
app.use(compression());


const server = app.listen(PORT, () => { console.log(`listening on ${PORT}`) });

//functions to handle errors
const errors = require('./middleware/errors');

//add middleware which handle CORS problems
app.use(require('./middleware/cors').cors);

//add middleware which parse in json the body of the post request.
//limit means that the maximum body dimension in a post request is 1 megabyte
app.use('/get',express.json({ limit: '1mb' }));
app.use('/get', auth.checkToken);
app.use('/get', get);

app.use('/login',express.json({ limit: '1mb' }));
app.use('/login', login);

app.use('/logout', logout);

//middleware to handling error
app.use(errors.errorJSONParser);
app.use(errors.sanitizerErr);
app.use(errors.genericError);
