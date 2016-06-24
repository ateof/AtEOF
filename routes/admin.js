var express = require('express');
var router = express.Router();
var Post = require('../entities/Post');

router.get('/list', (req, res, next) => {
  Post.find(null, 1).then(function (result) {
    res.render('admin/list', {posts: result});
  }).catch(function (err) {
    next(err);
  });
}).get('/edit/:id', (req, res, next) => {
  // Post.findById(req.params.id).then(function (result) {
  //   res.render('editor', {post: result});
  // });
  res.render('admin/editor');
});

module.exports = router;
