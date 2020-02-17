const logger = require('../../services/logger')
const express = require('express');
const router = new express.Router();
const Tweet = require('../../services/Tweet.service.js');


router.get('/', (req, res) => {

  res.send('INDEX');
});


router.get('/all', (req, res) => {
  // const all = TweetModel.findAll({ offset: 0, limit: 15 })
  //   .then(tweet => {
  //     logger("retrived tweet\n\n======");
  //   })
  //   .catch(e => logger("Error:", e));
  res.send('All tweets');
});


router.get('/pending', (req, res) => {
  TweetModel.find({
    where: {isPending: 1}
  })
    .then(pending => {
      const tweets = pending 
      logger("retrived tweets\n\n======");
    })
    .catch(e => logger("Error:", e));
  res.send(tweets);
});


router.get('/published', (req, res) => {
  TweetModel.find({
    where: {isPending: 0}
  })
    .then(published => {
      const tweets = published 
      logger("retrived tweets\n\n======");
    })
    .catch(e => logger("Error:", e));
  res.send(tweets);
});

// PUBLISH //
router.get('/t', async (req, res) => {
  let { comment, author, tweet_account } = req.query;
  Tweet.saveAndPublish({ comment, author, tweet_account });
  Tweet.emitter.once('success', () => {
    return res.status(200,'SENT')
  });

  Tweet.emitter.on('error', err => {
    const defaultError = 'Whoops! something went wrong';
    if (!err || !err.code) {
      return res.redirect(
        '/error/?e=' + encodeURIComponent('Check your connection')
      );
    } else if (err.code === 187) {
      // 187 = Status is a duplicate
      return res.redirect('/error/?e=' + encodeURIComponent(err.message));
    } else {
      return res.redirect('/error?e=' + encodeURIComponent(defaultError));
    }
  });
  return res.end()
});


router.get('/thanks', (req, res) => {
  res.send('Thanks');
})

module.exports = router;
