var db = require('./db');
module.exports = exports = Post;

var postDefine = {
  markdown: {
    type: String,
    required: true
  },
  html: String,
  publish: Boolean
};

db.createTable(postDefine).then((result) => {
  console.log(result);
}).catch((err) => {
  console.log(err);
});

function Post(post) {
  this.id = null;
  for (var field in post) {
    if (post.hasOwnProperty(field)) {
      if (postDefine[field]) {
        this[field] = post[field];
      }
    }
  }
}

Post.prototype.save = function () {
  if(!this.id){
    return db.insert('post', this);
  } else {
    Post.update(this.id, this);
  }
};

Post.findById = function (id) {
  return db.findById('post', id);
};

// 模糊查询
Post.find = function (keywords, page) {
  var condition = '';
  if(keywords){
    var arr = keywords.split(/\s|,|，/).filter((word) => {
      return word;
    }).map(function (word) {
      return `markdown LIKE %${word}% `;
    });
    condition = arr.join(' OR ');
  }
  return db.find('post', {
    size: 15,
    page: page,
    orderBy: 'createAt DESC',
    condition: condition
  });
};

Post.update = function (id, result) {
  return db.update('post', `id = ${id}`, result);
};

