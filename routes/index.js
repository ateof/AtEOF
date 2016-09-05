var express = require('express');
var router = express.Router();
var Post = require('../entities/Post');
var auth = require('./auth');
var trimHtml = require('trim-html');

router
  .get('/', (req, res, next) => {
    Post.findPublished(null, 1).then(result => {
      res.render('index', {
        title: 'AtEOF',
        posts: result.map(post => {
          post.summary = trimHtml(post.html, {
            more: true,
            limit: 300
          }).html;
          return post;
        })
      });
    }).catch(function (err) {
      next(err);
    });
  })
  .get('/posts', (req, res, next) => {
    var keywords = req.query.keywords;
    var page = parseInt(req.query.page) || 1;
    Post.findPublished(keywords, page).then((result) => {
      res.render('posts', {
        title: '文章列表',
        posts: result
      });
    }).catch(function (err) {
      next(err);
    });
  })
  .get('/posts/:id', (req, res, next) => {
    Post.findById(req.params.id).then((result) => {
      res.render('post', {
        title: result.title,
        post: result
      });
    });
  })
  .get('/editor', auth, (req, res, next) => {
    res.render('editor');
  });

module.exports = router;
