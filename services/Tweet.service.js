const logger = (...txt) => console.log(...txt);
const bot = require('./tweetBot');
const { createQueue } = require('./queue.js');
const schema = require('./tweet.validetor');
//DB
const models = require('../models');
const TweetModel = models.Tweet;

// INIT EMITS
const EventEmitter = require('events').EventEmitter;
const emitter = new EventEmitter();

// INIT Queue :
const tweetQ = createQueue();
const isDeQing = (state = true) => state;
// let testQ = true; // for test the queue
_handleQueue();

// TWEET FUNCTIONS / METHODS :
// ==========================
function saveAndPublish(tweet) {
  tweet.createdAt = Date.now();
  logger('on save and publish')

  // const { error, value } = schema.validate(tweet);
  // if (error) throw Error('schema error', error);

  logger('going to DB', tweet);
  // return;
  // INSERT TO TABLE
  TweetModel.create(tweet)
    .then(tweet => {
      toPublish(tweet.dataValues.comment);
      emitter.emit('success');
    })
    .catch(e => {
      logger('==== ERROR: ====', e);
      emitter.emit('error');
    });
}

function toPublish(status) {
  bot.post('statuses/update', { status }, function(err, data, res) {
    if (err) {
      if (!isDeQing()) {
        logger('\nisDequeuing On: ', isDeQing());
        _handleQueue();
      }
      // if (err && err.code === 187) return new Error({ ...err });
      tweetQ.enqueue({ status, type: 'toPublish' });
      // make queue run if stoped
      logger(err);
      // testQ = false; //for test the queue
    } else {
      logger('==> ', data.text, '\n tweeted');
    }
  });
}

const Tweet = {};
Tweet.saveAndPublish = saveAndPublish;
Tweet.emitter = emitter;

module.exports = Tweet;


// =======================
// PRIVATE Fuctions / Methods
// =======================

function _handleQueue() {
  while (!tweetQ.isEmpty) {
    setTimeout(() => {
      const { type, status } = tweetQ.dequeue();
      const action = {};
      action.type = type;
      action.payload = status;
      _reducer(action);
    }, 1000);
  }
  isDeQing(false);
}

// Initiate funcion from queue : 
function _reducer(action) {
  switch (action.type) {
    case 'toPublish':
      toPublish(action.payload);
      break;

    default:
      break;
  }
}
