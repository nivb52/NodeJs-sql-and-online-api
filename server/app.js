const express = require('express');
const logger = require('morgan');
const createError = require('http-errors');
const path = require('path');
const exphbs = require('express-handlebars');

// APP
const app = express();
// DEBUG
app.use(logger('default','dev'));
app.use(express.urlencoded({ extended: false }));

// ================ //
// view engine setup
// ================ //
app.set('views', path.join(__dirname, 'web', 'views'));
// Handlebars
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Set static folder
app.use(express.static(path.join(__dirname, 'web', 'public')));

// \/\/\/\/\/\/\/\/\ //
// ================ //
// ROUTES //
// ================ //
app.use('/', require('./routes/tweet'));
// Don't create an error if favicon is requested
app.use((req, res, next) => {
  if (req.originalUrl && req.originalUrl.split('/').pop() === 'favicon.ico') {
    return res.sendStatus(204);
  }
  return next();
});


module.exports = app;
