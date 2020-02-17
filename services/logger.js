require('dotenv').config();
const env = process.env.NODE_ENV || 'development';
const isDev = (env === 'development' || env === 'dev') ? true : false
const logLocal = true;
let logger;

if (logLocal && isDev) {
  logger = (...txt) => console.log(...txt);
} else {
  logger = () => {}
  const Sentry = require('@sentry/node');
  Sentry.init({
    dsn: process.env.SENTRY_ID,
    maxBreadcrumbs: 50,
    debug: isDev,
    integrations: function(integrations) {
      return integrations;
    }
  });
}

module.exports = logger;
