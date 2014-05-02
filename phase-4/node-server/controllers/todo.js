//
// Imports
//
var aws = require('../aws');
var fs = require('fs');
var async = require('async');
var mongoose = require('mongoose');

var logger = require('../logger').prefix('/api/todo');
var adminManager = require('../adminManager');
var Todo = require('../todoList').Todo;
var TodoList = require('../todoList').TodoList;

/*
 * Todo routes:
 *
 * GET     /api/todo/:id/files      Get all of the files for a todo
 * GET     /api/todo/:id/file/:name Get a specific file
 * DELETE  /api/todo/:id/file/:name Delete a specific file
 * POST    /api/todo/:id/files      Upload (overwrite) a file
 * PUT     /api/todo/:id      Update a todo
 * DELETE  /api/todo/:id      Delete a specific todo
 */

//
// Private functions
//
/**
 * Gets the folder path for a Todo
 *
 * @param {number} todoId Todo ID
 */
function getTodoPath(todoId) {
    return 'todos/' + todoId + '/';
}

/**
 * Gets the file path for a Todo file
 *
 * @param {number} todoId Todo ID
 * @param {string} fileName File name
 */
function getTodoFilePath(todoId, fileName) {
    return getTodoPath(todoId) + fileName;
}

//
// Routes
//
/**
 * GET /api/todo/:id/files
 *
 * Get all of the files for a todo
 */
function getFiles(req, res) {
    var todoPath = getTodoPath(req.params.id);

    aws.s3list(
        todoPath,
        function(err, data) {
            adminManager.hit(0);

            if (err) {
                return res.send(500, err);
            }

            var files = [];
            for (var i = 0; i < data.Contents.length; i++) {
                var fileName = data.Contents[i].Key;

                // skip directory name
                if (fileName == todoPath) {
                    continue;
                }

                // trim path from name
                fileName = fileName.replace(todoPath, '');

                files.push(fileName);
            }

            res.send(files);
        });
}

/**
 * GET /api/todo/:id/file/:name
 *
 * Gets a specific file
 */
function getFile(req, res) {
    var todoFilePath = getTodoFilePath(req.params.id, req.params.name);

    aws.s3get(
        todoFilePath,
        function(err, data) {
            if (err) {
                adminManager.hit(0);
                res.send(500, err);
            }

            var buff = new Buffer(data.Body, "binary");
            res.send(buff);

            adminManager.hit(buff.length);
        });
}

/**
 * DELETE /api/todo/:id/file/:name
 */
function deleteFile(req, res) {
    var todoFilePath = getTodoFilePath(req.params.id, req.params.name);

    aws.s3delete(
        todoFilePath,
        function(err, data) {
            adminManager.hit(0);

            if (err) {
                res.send(500, err);
            }

            res.send(true);
        });
}

/**
 * POST /api/todo/:id/files
 */
function postFile(req, res) {
    if (typeof req.files.file === 'undefined') {
        return res.send(500, 'File must be specified');
    }

    var todoFilePath = getTodoFilePath(req.params.id, req.files.file.name);

    // read file in
    async.waterfall(
    [
        function(cb) {
            fs.readFile(req.files.file.path, cb);
        },
        function(data, cb) {
            adminManager.hit(data.length);

            aws.s3put(
                todoFilePath,
                data,
                cb);
        }
    ], function(err, result) {
        res.send(err ? 500 : 200, err || true);
    });
}

/**
 * PUT /api/todo/:id
 */
function updateTodo(req, res) {
    var userId = req.get('userId');
    var ObjectId = mongoose.Types.ObjectId;
    var id = new ObjectId(req.params.id);
    var todoInput = req.body;

    TodoList.findOne({ OwnerId: userId, 'Todos._id': id }, {'Todos.$': 1}, function(err, todoList){
      if (err) {
        return res.send(500, err);
      }

      if (!todoList) {
        return res.send(404);
      }
	  
	  var todo = todoList.Todos[0];
      todoList.Todos[0].Completed = todoInput.Completed;
      todo.markModified('Completed');

      todoList.save(function(err, list) {
        if (err) {
          return res.send(500, err);
        }

        return res.send(todo.serialize());
      });
    });
}

/**
 * DELETE /api/todo/:id
 */
function deleteTodo(req, res) {
    var userId = req.get('userId');
    var ObjectId = mongoose.Types.ObjectId;
    var id = new ObjectId(req.params.id);

    TodoList.findOne({ OwnerId: userId, 'Todos._id': id }, {'Todos.$': 1}, function(err, todoList){
      if (err) {
        return res.send(500, err);
      }

      if (!todoList || todoList.Todos.length <= 0) {
        return res.send(404);
      }	  

      todoList.Todos[0].remove();
	  todoList.save(function(err) {
        if (err) {
          return res.send(500, err);
        }

        return res.send(200);
      });
    });
}


//
// Exports
//
exports.getFiles = getFiles;
exports.getFile = getFile;
exports.deleteFile = deleteFile;
exports.postFile = postFile;
exports.updateTodo = updateTodo;
exports.deleteTodo = deleteTodo;
