require('dotenv').config();

const express = require('express');
const { validationResult, body } = require('express-validator');
const app = express();

const PORT = process.env.PORT || 7778;

const {aggregator} = require('./routers/aggregation');

const {divider} = require('./CALCULATOR_modules/divider');

app.use(express.json());

app.use('/aggregate', aggregator);

const server = app.listen(PORT, () => { console.log(`listening on ${PORT}`) });

function errorJSONParser(err, request, response, next) {
  if (err instanceof SyntaxError && err.status === 400) {
      response.status(400).json({ status: 400, errors: ['body must be in json'] });
      return;
  }
  next(err);
}

function genericError(err, request, response, next) {
  console.error(err.stack);
  response.status(400).json({ status: 400, errors: ['Something went wrong'] });
  return;
}

//middleware to handling error
app.use(errorJSONParser);
app.use(genericError);
