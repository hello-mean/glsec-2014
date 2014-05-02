//
// Imports
//
var async = require('async');
var _ = require('lodash-node');
var mongoose = require('mongoose');

var Todo = require('../todoList').Todo;
var TodoList = require('../todoList').TodoList;

var logger = require('../logger').prefix('/api/todolists');

/*
 * TodoList routes:
 *
 * POST    /api/todolist/:id/todos  Post a todo to a list
 * GET     /api/todolist/:id/todos  Get todos for a list
 * GET     /api/todolist      Get all of the todos for the user
 * GET     /api/todolist/:id  Get a specific todolist
 * DELETE  /api/todolist/:id  Delete a specific todolist
 * POST    /api/todolist      Create a new todolist
 */


//
// Routes
//
/**
 * GET /api/todolist
 */
function getTodoLists(req, res) {
    var userId = req.get('userId');

    TodoList.find({ OwnerId: userId }, function(err, lists){
      if (err) {
        return res.send(500, err);
      }

      if (!lists) {
        return res.send(404);
      }

      var displayLists = _.map(lists, function(l) { return l.serialize(); });

      return res.send(displayLists);
    });
}

/**
 * GET /api/todolist/:id
 */
function getTodoList(req, res) {
    var userId = req.get('userId');
    var ObjectId = mongoose.Types.ObjectId;
    var id = new ObjectId(req.params.id);

    TodoList.findOne({ OwnerId: userId, _id: id }, function(err, list){
      if (err) {
        return res.send(500, err);
      }

      if (!list) {
        return res.send(404);
      }

      return res.send(list.serialize());
    });
}

/**
 * DELETE /api/todolist/:id
 */
function deleteTodoList(req, res) {
    var userId = req.get('userId');
    var ObjectId = mongoose.Types.ObjectId;
    var id = new ObjectId(req.params.id);

    TodoList.remove({ OwnerId: userId, _id: id }, function(err){
      if (err) {
        return res.send(500, err);
      }

      return res.send(200);
    });
}

/**
 * POST /api/todolist
 */
function addTodoList(req, res) {
    var userId = req.get('userId');
    var todoList = new TodoList(req.body);
    todoList.OwnerId = userId;

    TodoList.create(todoList, function(err, list){
      if (err) {
        return res.send(500, err);
      }

      return res.send(200, list.serialize());
    });
}

/**
 * POST    /api/todolist/:id/todos
 */
function addTodo(req, res) {
    var userId = req.get('userId');
    var todo = new Todo(req.body);

    var ObjectId = mongoose.Types.ObjectId;
    var id = new ObjectId(req.params.id);

    TodoList.findOne({ OwnerId: userId, _id: id }, function(err, list){
      if (err) {
        return res.send(500, err);
      }

      if (!list) {
        return res.send(404);
      }

      list.Todos.push(todo);

      list.save(function(err, list) {
        if (err) {
          return res.send(500, err);
        }

        return res.send(todo.serialize());
        //return res.send(req.body);
      });
    });
}

/**
 * GET /api/todolist/:id/todos
 */
function getTodos(req, res) {
    var userId = req.get('userId');
    var ObjectId = mongoose.Types.ObjectId;
    var id = new ObjectId(req.params.id);

    TodoList.findOne({ OwnerId: userId, _id: id }, function(err, list){
      if (err) {
        return res.send(500, err);
      }

      if (!list) {
        return res.send(404, { msg: "stuff not found"});
      }

      var tempList = list.serialize();

      return res.send(tempList.Todos);
    });
}



//
// Exports
//
exports.getTodoLists = getTodoLists;
exports.getTodoList = getTodoList;
exports.deleteTodoList = deleteTodoList;
exports.addTodoList = addTodoList;
exports.addTodo = addTodo;
exports.getTodos = getTodos;
