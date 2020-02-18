const logger = require('../../services/logger');
const Tweet = require('../../services/Tweet.service.js');
const defaultError = 'Whoops! something went wrong';
// express
const express = require('express');
const router = new express.Router();
const createError = require('http-errors');

// PUBLISH TWEET //
router.post('/t', async (req, res) => {
  const { comment, author, tweet_account } = req.query;
  const checkTweet = { comment, author, tweet_account };

  const { value, error } = await Tweet.validation(checkTweet);

  if (error) {
    const msg = encodeURIComponent(error.message.substring(5));
    res.status(200).redirect('/error?e=' + msg);
    return;
  }
  // define to get twit errors
  let msg = 'SENT';
  let resStatus = 200;
  // INSERT TO TABLE
  await Tweet.Model.create(value)
    .then(tweet => {
      Tweet.post({ comment: tweet.dataValues.comment, commentId: tweet.id });
      // show Tweet.post error if there is
      if (tweet.status > 400 || tweet.code) {
        msg = tweet.message;
        resStatus = tweet.code ? tweet.status : 200;
        res.status(resStatus).send(msg);
      }
      res.redirect('/thanks');
    })
    .catch(e => {
      logger('error: ', e);
      msg = 'posting problem, we will keep trying';
      res.status(resStatus).send(msg);
    });
  return;
});

router.get('/all', async (req, res) => {
  try {
    const tweets = await Tweet.Model.findAll({
      offset: 0,
      limit: 15
    });
    let data = tweets.map(tweet => tweet.dataValues);
    data = JSON.stringify(data);
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(data);
  } catch (e) {
    return;
  }
});

router.get('/pending', async (req, res) => {
  let data;
  Tweet.Model.findAll({
    where: { isPending: 1 }
  })
    .then(tweets => {
      data = tweets.map(tweet => tweet.dataValues);
      data = JSON.stringify(data);
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(data);
    })
    .catch(e => logger('Error:', e));
});

router.get('/published', async (req, res) => {
  let data;
  Tweet.Model.findAll({
    where: { isPending: 0 }
  })
    .then(tweets => {
      data = tweets.map(tweet => tweet.dataValues);
      data = JSON.stringify(data);
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(data);
    })
    .catch(e => logger('Error:', e));
});

router.get('/', (req, res) => {
  res.status(200).send('INDEX');
});



router.get('/thanks', (req, res) => {
  res.status(200).send('Thanks');
});


// EMMITS
Tweet.emitter.on('error', err => {
  if (!err || !err.code) {
    createError('Check your connection');
  } else if (err.code === 187) {
    // 187 => msg:  Status is a duplicate
    createError(err.message);
  } else {
    createError(defaultError);
  }
});

module.exports = router;
