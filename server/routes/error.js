const express = require('express');
const router = new express.Router();
const logger = require('../../services/logger')

router.get('/', (req, res) => {
    const { e  } = req.query || 'Something went wrong';
    logger(e)
    res.status(500, e).end();
  });



module.exports = router;
