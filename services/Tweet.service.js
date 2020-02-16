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
const isDequeueRunning = (state = true) => state;
// let testQ = true; // for test the queue
_handleQueue();

// TWEET FUNCTIONS / METHODS :
// ==========================
function saveAndPublish(tweet) {
  tweet.createdAt = Date.now();
  
  const { error, value } = schema.validate(tweet);
  if (error) return emitter.emit('error', error); 

  logger('value', value);
  
  return emitter.emit('success');
  // INSERT TO TABLE
  TweetModel.create(value)
    .then(tweet => {
      try {
        toPublish(tweet.dataValues.comment);
        emitter.emit('success');
      } catch (e) {
        emitter.emit('error');
      }
    })
    .catch(e => {
      // logger('==== ERROR: ====', e);
      emitter.emit('error');
    });
    emitter.emit('success');
}

function toPublish(status) {
  bot.post('statuses/update', { status }, function(err, data, res) {
    if (err) {
      if (err.code === 187) {
        emitter.emit('error', err);
        return;
      }
      if (!isDequeueRunning()) {
        logger('\nisDequeuing On: ', isDequeueRunning());
        // make dequeue-ing proccess run if stoped
        _handleQueue();
      }
      tweetQ.enqueue({ status, type: 'toPublish' });
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
  isDequeueRunning(false);
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
