var express = require('express');
var router = express.Router();
var config = require('../config.json');
var Post = require('../entities/Post');
/* GET login listing. */
router.get('/', (req, res, next) => {
  res.render('login');
}).post('/', (req, res, next) => {
  var password = req.body.password;
  var username = req.body.username;
  if (config.username == username && config.password == password) {
    req.session.username = username;
  }
  Post.find(null, 1).then(function (result) {
    res.render('admin/list', {posts: result});
  }).catch(function (err) {
    next(err);
  });
});

module.exports = router;
