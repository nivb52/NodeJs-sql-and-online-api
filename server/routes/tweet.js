const express = require("express");
const router = new express.Router();

//DB
const models = require("../../models");
// const db = require("../../db/connect");
const db = models.db;
const Tweet = models.Tweet;

router.get("/", (req, res) => {
  const all = Tweet.findAll()
    .then(tweet => {
      console.log(tweet);
    })
    .catch(e => console.log("Error:", e));
  console.log(all);

  res.send("INDEX");
});

router.get("/add", (req, res) => {
  const data = {
    comment: "Use your VOTE",
    author: "YAEL",
    updatedAt: null
  };
  // INSERT TO TABLE
  Tweet.create({
    comment: data.comment,
    author: data.author,
    updatedAt: data.updatedAt
  })
    .then(tweet => {
      console.log("======\n ", tweet, "======\n ");
      res.redirect("/");
    })
    .catch(e => console.log("==== ERROR: ====", e));
});

module.exports = router;
