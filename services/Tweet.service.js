const logger = require('../services/logger')

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
async function saveAndPublish(tweet) {
  tweet.isPending = 1; // default -> true
  tweet.createdAt = Date.now();

  const { error, value } = schema.validate(tweet);
  if (error) return emitter.emit('error', error);

  logger('value', value);

  // INSERT TO TABLE
  TweetModel.create(value)
    .then(tweet => {
      try {
        toPublish({status: tweet.dataValues.comment, statusId: tweet.id});
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

async function toPublish({status, statusId}, onError, onCompleted) {
  bot.post('statuses/update', { status }, (err, data, res) => {
    if (err) {
      emitter.emit('error', err);
      if (err.code === 187) return 
      
      tweetQ.enqueue({payload: {status, statusId} , type: 'toPublish' });
      // make dequeue-ing proccess run if stoped
      if (!isDequeueRunning()) {
        logger('\nisDequeuing On: ', isDequeueRunning());
        _handleQueue();
      }
      // testQ = false; //for test the queue
    } else {
      // ON PUBLISH -> UPDATE :
      TweetModel.update({
        isPending: 0
      }, {
        where: {
          id : statusId
        }
      })
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
