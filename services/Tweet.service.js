const logger = require('../services/logger');
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

// Queue / Reducer TYPES :
const POST_TWEET = 'postTweet';

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
        postTweet({ comment: tweet.dataValues.comment, commentId: tweet.id });
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

async function postTweet({ comment, commentId }) {
  bot.post('statuses/update', { comment }, (err, data, res) => {
    if (err) {
      emitter.emit('error', err);
      if (err.code === 187) return;

      tweetQ.enqueue({ payload: { comment, commentId }, type: POST_TWEET });
      // start dequeue-ing proccess if stoped
      if (!isDequeueRunning()) {
        logger('\nisDequeuing On: ', isDequeueRunning());
        _handleQueue();
      }
      // testQ = false; //for test the queue
    } else {
      // ON PUBLISH -> UPDATE :
      updatePending(commentId);
    }
  });
}

async function updatePending(tweetId) {
  try {
    const tweet = await TweetModel.update(
      {
        isPending: 0
      },
      {
        where: {
          id: tweetId
        }
      }
    );
  } catch (e) {
    logger('error: ', e);
    emitter.emit('error', err);
  }
  logger('==> ' + data.text + '\n tweeted');
  return tweet;
}

async function getPending() {
  try {
    const pendingTweets = await TweetModel.find({
      where: { isPending: 1 }
    });
  } catch (e) {
    logger('Error:', e);
  }
  logger('retrived tweets\n\n======');
  return pendingTweets;
}

function getPublished() {
  TweetModel.find({
    where: {isPending: 0}
  })
    .then(published => {
      logger("retrived tweets\n\n======");
      return published 
    })
    .catch(e => logger("Error:", e));
}

const Tweet = {};
Tweet.saveAndPublish = saveAndPublish;
Tweet.emitter = emitter;
Tweet.getPending = getPending;
Tweet.getPublished = getPublished;

module.exports = Tweet;

// =======================
// PRIVATE Fuctions / Methods
// =======================

function _handleQueue() {
  while (!tweetQ.isEmpty) {
    setTimeout(() => {
      const { type, comment } = tweetQ.dequeue();
      const action = {};
      action.type = type;
      action.payload = comment;
      _reducer(action);
    }, 1000);
  }
  isDequeueRunning(false);
}

// Initiate funcion from queue :
function _reducer(action) {
  switch (action.type) {
    case POST_TWEET:
      postTweet(action.payload);
      break;

    default:
      break;
  }
}
