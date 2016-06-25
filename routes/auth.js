/**
 * Created by Administrator on 2016/6/25.
 */
var basicAuth = require('basic-auth');
var config = require('../config.json');

module.exports = function (req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.send(401);
  }

  if (req.session.login) {
    return next();
  }

  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  }

  if (user.name === config.username && user.pass === config.password) {
    req.session.login = true;
    return next();
  } else {
    return unauthorized(res);
  }
};
