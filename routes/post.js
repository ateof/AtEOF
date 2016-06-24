var express = require('express');
var router = express.Router();
var Post = require('../entities/Post');

router.get('/', (req, res, next) => {
  var keywords = req.query.keywords;
  var page = parseInt(req.query.page) || 1;
  Post.find(keywords, page).then(function (result) {
    res.render('posts', {posts: result});
  }).catch(function (err) {
    next(err);
  })
}).get('/:id', (req, res, next) => {
  Post.findById(req.params.id).then(function (result) {
    res.render('post', {post: result});
  });
});

module.exports = router;
