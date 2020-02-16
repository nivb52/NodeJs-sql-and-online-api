require("dotenv").config();
const Twit = require("twit");

const bot = new Twit({
  consumer_key: process.env.TWIT_API_KEY,
  consumer_secret: process.env.TWIT_SECRET_KEY,
  access_token: process.env.TWIT_ACCESS_TOKEN,
  access_token_secret: process.env.TWIT_ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000
});

module.exports = bot;
