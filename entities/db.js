var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('ateof.db');
var extend = require('util')._extend;
var TypeMap = {
  Number: 'INTEGER',
  String: 'TEXT',
  Date: 'INTEGER',
  Boolean: 'INTEGER'
};

module.exports.createTable = function (table, define) {
  var fields = [];
  for (var field in define) {
    // 格式 count INTEGER NOT NULL
    if (define.hasOwnProperty(field)) {
      var type = define[field];
      var result = field;
      if (typeof type == 'object') {
        result += ` ${TypeMap[type.type.name]}`;
        if (type.required) {
          result += ' NOT NULL'
        }
      } else {
        result += ` ${TypeMap[type.name]}`;
      }
    }
    fields.push(result);
  }
  fields.push('createAt INTEGER');
  fields.push('updateAt INTEGER');
  var sql = `CREATE TABLE IF NOT EXISTS ${table} (id INTEGER PRIMARY KEY, ${fields.join(',')}) `;
  console.log(sql);
  return new Promise((resolve, reject) => {
    db.run(sql, (err, result) => {
      console.log('创建表', err, result);
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  })
};
/**
 * 查看表是否存在
 * @param table
 * @returns {Promise}
 */
module.exports.isTableExists = function (table) {
  return new Promise((resolve, reject) => {
    db.run(`SELECT COUNT(*) FROM sqlite_master where type="table" and name="${table}"`, function (err, data) {
      if (err) {
        return reject(err);
      }
      console.log('isTableExists', data);
      resolve(data);
    });
  });
};

/**
 * 按ID查询
 * @param {String} table
 * @param {Number} id
 * @param {Array<String>} [fields]
 * @returns {Promise}
 */
module.exports.findById = function (table, id, fields) {
  var cols = '*';
  if (fields) {
    cols = fields.join(',');
  }
  return new Promise((resolve, reject) => {
    db.get(`SELECT ${cols} FROM ${table} WHERE id=${id}`, (err, row) => {
      if (err) {
        return reject(err);
      }
      resolve(row);
    });
  });

};

/**
 * 查询
 * @param {String} table
 * @param {Object} options
 * @param {Number} options.page 页数
 * @param {Number} options.size 每页大小
 * @param {String} options.condition where 条件
 * @param {String} options.orderBy 排序
 * @param {Array<String>} [fields] 数组，要查询的字段
 * @returns {Promise}
 */
module.exports.find = function (table, options, fields) {
  var opts = {
    page: 1,
    size: 1000,
    orderBy: '',
    condition: ''
  };
  extend(opts, options);
  var cols = '*';
  if (fields) {
    cols = fields.join(',');
  }
  var where = '';
  if (opts.condition) {
    where = 'WHERE ' + opts.condition;
  }

  var order = '';
  if (opts.orderBy) {
    order = 'ORDER BY ' + opts.orderBy;
  }
  var current = (opts.page - 1) * opts.size;
  var sql = `SELECT ${cols} FROM ${table} ${where} ${order} LIMIT ${opts.size} OFFSET ${current}`;
  console.log(sql);
  return new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });

};

/**
 * 更新
 * @param {String} table
 * @param {String} condition
 * @param {Object} result
 * @returns {Promise}
 */
module.exports.update = function (table, condition, result) {
  var sets = [];
  var results = [];
  for (var key in result) {
    if (result.hasOwnProperty(key) && key != 'id') {
      sets.push(key + ' = ? ');
      results.push(result[key]);
    }
  }
  var where = '';
  if (condition) {
    where = 'WHERE ' + condition;
  }
  var sql = `UPDATE ${table} SET ${sets.join(',')}, updateAt=DATETIME('now', 'localtime') ${where}`;
  return new Promise((resolve, reject) => {
    db.run(sql, results, (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(data);
    });
  });
};

module.exports.insert = function (table, entity) {
  var fields = [];
  var values = [];
  var q = ['?', '?'];
  for (var field in entity) {
    if (entity.hasOwnProperty(field)) {
      if (field != 'id') {
        fields.push(field);
        var value = entity[field];
        values.push(value);
        q.push('?');
      }
    }
  }
  // 创建更新时间
  fields.push('createAt');
  values.push(new Date().getTime());

  fields.push('updateAt');
  values.push(new Date().getTime());

  var sql = `INSERT INTO ${table} (${fields.join(',')}) VALUES (${q.join(',')})`;
  console.log(sql);
  return new Promise((resolve, reject) => {
    db.run(sql, values, function (err, result) {
      if (err) {
        return reject(err);
      }
      resolve({id: this.lastID});
    });
  });
};

module.exports.escape = function (keyword) {
  keyword = keyword.replace(/\//g, "//");
  keyword = keyword.replace(/'/g, "''");
  keyword = keyword.replace(/\[/g, "/[");
  keyword = keyword.replace(/]/g, "/]");
  keyword = keyword.replace(/%/g, "/%");
  keyword = keyword.replace(/&/g, "/&");
  keyword = keyword.replace(/_/g, "/_");
  keyword = keyword.replace(/\(/g, "/(");
  keyword = keyword.replace(/\)/g, "/)");
  return keyword;
};
