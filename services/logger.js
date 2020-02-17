require('dotenv').config();
const env = process.env.NODE_ENV || 'development';
const logLocal = process.env.LOCAL_LOGGER || 'true';
let logger;

if (logLocal && (env === 'development' || env === 'dev')) {
  logger = (...txt) => console.log(...txt);
} else {
  const Sentry = require('@sentry/node');
  logger = Sentry.init({
    dsn: process.env.SENTRY_ID,
    maxBreadcrumbs: 50,
    debug: true,
    integrations: function(integrations) {
      return integrations.concat(new Integrations.Dedupe());
    }
  });
}

module.exports = logger;
