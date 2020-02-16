const express = require('express');
const router = new express.Router();
const logger = (...txt) => console.log(...txt);

router.get('/', (req, res) => {
    const { e  } = req.query || 'Something went wrong';
    res.status(500, e).end();
  });



module.exports = router;
