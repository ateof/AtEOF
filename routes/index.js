var express = require('express');
var router = express.Router();
var Post = require('../entities/Post');
var auth = require('./auth');
router.get('/posts', (req, res, next) => {
  var keywords = req.query.keywords;
  var page = parseInt(req.query.page) || 1;
  Post.find(keywords, page).then((result) => {
    res.render('posts', {posts: result});
  }).catch(function (err) {
    next(err);
  })
}).get('/posts/:id', (req, res, next) => {
  Post.findById(req.params.id).then((result) => {
    res.render('post', {post: result});
  });
}).get('/editor', auth, (req, res, next) => {
  res.render('editor');
});

module.exports = router;
