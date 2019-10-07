const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const gitoRouter = require('./routes/gito');
const graphqlHttp = require('express-graphql')
const graphql_schema = require('./schema/graphql_schema')
const mongoose = require('mongoose')
import cors from 'cors' 
import 'dotenv/config'
import {schema} from './schema/graphql_schema'

const openConnection = () => {
  mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0-zauig.mongodb.net/${process.env.DB_NAME}?retryWrites=true&r=majority`, {useNewUrlParser: true})
  mongoose.connection.once('open', () => {
    console.log("Server Opened...")
  })
}

openConnection();

const app = express();

app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/gito', gitoRouter);
app.use('/graphql', graphqlHttp({
  schema: schema
}))

app.get('/', (req, res, next) => {

  return res.json({
    message: "Hi, Gito Welcomes You!"
  })
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({error: 'error'});
});

module.exports = app
