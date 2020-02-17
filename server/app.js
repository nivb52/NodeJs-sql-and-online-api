const express = require('express');
const logger = require('../services/logger');

const createError = require('http-errors');
const path = require('path');
const exphbs = require('express-handlebars');

// APP
const app = express();
app.use(express.urlencoded({ extended: false }));

app.set('views', path.join(__dirname, 'web', 'views'));
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));

// view engine setup
// ================ //
app.set('view engine', 'handlebars');

// Set static folder
app.use(express.static(path.join(__dirname, 'web', 'public')));

// \*/\*/\*/\*/\*/\*/\*/\*/\ //
// ================ //
// ROUTES //
// ================ //

app.use('/', require('./routes/tweet'));

app.use('/error', require('./routes/error'));

// ==============================
// DEFUALT USE ROUTES :
// ==============================

// Don't create an error if favicon is requested
app.use((req, res, next) => {
  if (req.originalUrl && req.originalUrl.split('/').pop() === 'favicon.ico') {
    return res.sendStatus(204);
  }
  return next();
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(res.send(createError(404)));
});

// other errors handler
app.use((err, req, res, next) => {
  let msg = err.message || 'Something went wrong';
  msg = encodeURIComponent(msg);
  // set locals, only providing error in development
  req.app.get('env') === 'development' ? err : {};
  if (err.statusCode > 404) logger(err);
  // render empty error page
  res.status(err.status || 500).redirect('/error/?e=' + msg);
});

module.exports = app;