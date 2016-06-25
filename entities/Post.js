var db = require('./db');
module.exports = exports = Post;

var postDefine = {
  title: {
    type: String,
    required: true
  },
  markdown: {
    type: String,
    required: true
  },
  html: {
    type: String,
    required: true
  },
  publish: Boolean
};

db.createTable('post', postDefine).then((result) => {
  console.log(result);
}).catch((err) => {
  console.log(err);
});

function Post(post) {
  for (var field in post) {
    if (post.hasOwnProperty(field)) {
      if (postDefine[field]) {
        this[field] = post[field];
      }
    }
  }
  if (post.id) {
    this.id = post.id;
  }
}

Post.prototype.save = function () {
  if (!this.id) {
    return db.insert('post', this);
  } else {
    return Post.update(parseInt(this.id), this).then((result) => {
      console.log('update', result);
      return {id: this.id};
    });
  }
};

Post.findById = function (id) {
  return db.findById('post', id);
};

// 模糊查询
Post.find = function (keywords, page, fileds) {
  var condition = '';
  if (keywords) {
    var arr = keywords.split(/\s|,|，/).filter((word) => {
      return word;
    }).map(function (word) {
      return `markdown LIKE '%${db.escape(word)}%' escape '/' `;
    });
    condition = arr.join(' OR ');
  }
  return db.find('post', {
    size: 15,
    page: page,
    orderBy: 'createAt DESC',
    condition: condition
  }, fileds);
};

Post.update = function (id, result) {
  return db.update('post', `id = ${id}`, result);
};

