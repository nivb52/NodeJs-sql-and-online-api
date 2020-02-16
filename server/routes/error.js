const express = require('express');
const router = new express.Router();
const logger = (...txt) => console.log(...txt);

router.get('/', (req, res) => {
    const { error = 'Something went wrong' } = req.query;
    res.send(error);
  });



module.exports = router;
