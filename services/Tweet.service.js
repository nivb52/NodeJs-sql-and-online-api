const logger = require('../services/logger');
const bot = require('./tweetBot');
const { createQueue } = require('./queue.js');
const schema = require('./tweet.validetor');

//DB
const models = require('../models');
const Model = models.Tweet;

// INIT EMITS
const EventEmitter = require('events').EventEmitter;
const emitter = new EventEmitter();

// INIT Queue :
const tweetQ = createQueue();
const isDequeueRunning = (state = true) => state;

setTimeout(() => {
  // start after user choose is first action
  _loadPendingToQueue();
}, 5000);

// Queue / Reducer TYPES :
const POST_TWEET = 'postTweet';

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ==========================
// TWEET FUNCTIONS / METHODS :
// ==========================
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~
async function validation(tweet) {
  tweet.isPending = 1; // default -> true
  tweet.createdAt = Date.now();

  const { error, value } = schema.validate(tweet);
  if (error) return emitter.emit('error', error);
  return { error, value };
}

async function postTweet({ comment, commentId }) {
  bot.post('statuses/update', { status: comment }, (err, data, res) => {
    if (err) {
      // start enqueue
      tweetQ.enqueue({ payload: { comment, commentId }, type: POST_TWEET });
      // restart dequeue-ing if proccess stoped
      if (!isDequeueRunning()) {
        _handleQueueRecursion();
      }
      logger('tweet NOT published', err);
      return err;
    } else {
      logger('tweet published');
      // ON PUBLISH -> UPDATE :
      _updatePending(commentId);
      return;
    }
  });
}

const Tweet = {};
Tweet.Model = Model;
Tweet.post = postTweet;
Tweet.validation = validation;
Tweet.emitter = emitter;

module.exports = Tweet;

// =======================
// PRIVATE Fuctions / Methods
// =======================
async function _loadPendingToQueue() {
  logger('Loading Pending Tweets...');
  let tweets;
  Model.findAll({
    where: { isPending: 1 }
  })
    .then(data => {
      tweets = data.map(tweet => tweet.dataValues);
      const pending = [];
      tweets.map(tweet => {
        let { comment, id } = tweet;
        pending.push({ payload: { comment, commentId: id }, type: POST_TWEET });
      });
      pending.map(tweet => tweetQ.enqueue(tweet));
      logger('tweets load');
      _handleQueueRecursion();
    })
    .catch(e => {
      return;
    });
}

async function _updatePending(tweetId) {
  logger('==> ' + tweetId);
  await Model.update(
    { isPending: 0 },
    {
      where: {
        id: tweetId
      }
    }
  )
    .then(tweet => {
      return;
    })
    .catch(e => {
      logger('error: ', e);
      emitter.emit('error', err);
    });
}

function _handleQueueRecursion() {
  isDequeueRunning(false);
  if (tweetQ.isEmpty()) return;
  // start proccess
  // logger('\n ==== \n --> current tweet: ', tweetQ.peek());
  setTimeout(() => {
    isDequeueRunning(true);
    const action = tweetQ.dequeue();
    logger('\n dequeueing ...  \n dequeue item: ', action);
    _reducer(action);
    _handleQueueRecursion();
  }, 60 * 1000);
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
