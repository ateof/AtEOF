var cheerio = require('cheerio');
var express = require('express');
var router = express.Router();
var Post = require('../entities/Post');

router.post('/posts', (req, res, next) => {
  console.log('body', req.body);
  var markdown = req.body.markdown;
  var html = req.body.html;
  var $ = cheerio.load(html);

  // 提取标题
  var title = '';
  for (var i = 1; i < 7; i++) {
    title = $('h' + 1).first().text();
    if (title) {
      break;
    }
  }
  if (!title) {
    title = $.text().substr(0, 25);
  }
  var publish = req.body.publish == 'true';
  var id = req.body.id;
  var post = new Post({
    id: id,
    title: title,
    html: html,
    markdown: markdown,
    publish: publish
  });
  console.log('post', post);
  post.save().then((result) => {
    console.log('save success', result);
    res.json(result);
  }).catch((error) => {
    next(error);
    console.log('save error', error);
  });
}).get('/posts', (req, res, next) => {
  var keywords = req.query.keywords;
  var page = req.query.page || 1;
  Post.find(keywords, page).then((posts) => {
    res.json(posts);
  }).catch((err) => {
    next(err);
  });
}).get('/posts/:id', (req, res, next) => {
  var id = req.params.id;
  Post.findById(id).then((post) => {
    res.json(post);
  }).catch((err) => {
    next(err);
  });
});

module.exports = router;
