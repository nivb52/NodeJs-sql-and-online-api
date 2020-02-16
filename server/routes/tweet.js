const express = require('express');
const router = new express.Router();
const logger = (...txt) => console.log(...txt);

const Tweet = require('../../services/Tweet.service.js');
// const TweetEm = Tweet.emitter

router.get('/', (req, res) => {
  // const all = TweetModel.findAll()
  //   .then(tweet => {
  //     logger("retrived tweet\n\n======");
  //   })
  //   .catch(e => logger("Error:", e));
  res.send('INDEX');
});

router.get('/tweet', (req, res) => {
  // let { comment, author, account } = req.query;
  const comment = 'Hello World';
  const author = ' ';
  const tweet_account = ' '; // tweet_account

  Tweet.saveAndPublish({ comment, author, tweet_account });
  Tweet.emitter.on('success', () => {
    res.redirect('/');
  });
  Tweet.emitter.on('error', err => {
    // 187 = Status is a duplicate
    if (err.code === 187) {
      res.redirect(200, '/error/?e=' + encodeURIComponent(err.message));
    } else
      res.redirect(
        200,
        '/error?e=' + encodeURIComponent('Whoops! something went wrong')
      );
  });
});

module.exports = router;
