require('dotenv').config();
const env = process.env.NODE_ENV || 'development';
const logLocal = true
let logger;

if ( logLocal &&(env === 'development' || env === 'dev' ) ){
  logger = (...txt) => console.log(...txt);
} else {
  logger = require('@sentry/node');
  logger.init({ dsn: process.env.SENTRY_ID });
}


module.exports = logger;