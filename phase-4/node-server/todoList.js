var mongoose = require('mongoose');


var todoSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Completed: { type: Boolean, default: false }
});


todoSchema.methods.serialize = function () {
  return {
    Id: this._id.toString(),
    Title: this.Title,
    Completed: this.Completed
  };
};

exports.Todo = mongoose.model('Todo', todoSchema);


var todoListSchema = mongoose.Schema({
    Name: { type: String, required: true },
    OwnerId: { type: String, required: true},
    Todos: [todoSchema]
});

todoListSchema.methods.serialize = function () {
  var obj = {
    Id: this._id.toString(),
    Name: this.Name,
    OwnerId: String,
    Todos: []
  };

  for(var i = 0; i < this.Todos.length; i++) {
    obj.Todos.push(this.Todos[i].serialize());
  }

  return obj;
};

exports.TodoList = mongoose.model('TodoList', todoListSchema);
