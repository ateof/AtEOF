var co = require('co');
var config = require('../config.json');
var formidable = require('formidable');
var util = require('util');
var fs = require('fs');
var path = require('path');
var url = require('url');
var ossConfig = config.oss;
var OSS = require('ali-oss').Wrapper;
var client = new OSS(ossConfig);

/**
 * 解析表单
 * @param req
 * @returns {*|Promise}
 */
module.exports.uploadFile = co.wrap(function*(req) {
  var formResult = yield parseForm(req);
  var files = formResult.files;

  // 接收到的文件都上传至阿里云
  for (var key in files) {
    if (files.hasOwnProperty(key)) {
      var file = files[key];
      var hash = file.hash;
      var type = 'files';
      if (isImageMime(file.type)) {
        type = 'images';
      }
      var result = yield uploadFile(file.path, type, hash);
      if (result.url) {
        file.url = result.url;
      }
    }
  }
  return files;
});

/**
 * 封装form.parse
 * @param req
 * @returns {Promise<T>|Promise}
 */
function parseForm(req) {
  return new Promise(function (resolve, reject) {
    var form = new formidable.IncomingForm();
    form.uploadDir = config.uploadDir;
    form.keepExtensions = true;
    form.hash = 'md5';
    form.multiples = false;

    form.parse(req, function (err, fields, files) {
      console.log('parse', fields);
      if (err) {
        return reject(err);
      }
      resolve({
        fields: fields,
        files: files
      });
    });
  });
}

function isImageMime(mime) {
  if (!util.isString(mime)) {
    return false;
  }
  var parts = mime.split('/');
  return parts[0] == 'image';
}

function uploadFile(filePath, type, hash) {
  var ext = path.extname(filePath);
  var filename = hash ? hash + ext : path.basename(filePath);
  var objectKey = [config.site, type, filename].join('/');
  var stream = fs.createReadStream(filePath);
  return client.putStream(objectKey, stream).then(function (result) {
    var pathname = url.parse(result.url).pathname;
    result.url = 'http://cdn.dejiazs.com' + pathname;
    return result;
  });
}

