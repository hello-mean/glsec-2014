//
// Imports
//
var aws = require('../aws');
var fs = require('fs');
var async = require('async');

var logger = require('../logger').prefix('/api/todo');

/*
 * Todo routes:
 *
 * GET     /api/todo/:id/files      Get all of the files for a todo
 * GET     /api/todo/:id/file/:name Get a specific file
 * DELETE  /api/todo/:id/file/:name Delete a specific file
 * POST    /api/todo/:id/files      Upload (overwrite) a file
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
                res.send(500, err);
            }

            var buff = new Buffer(data.Body, "binary");
            res.send(buff);
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
            aws.s3put(
                todoFilePath,
                data,
                cb);
        }
    ], function(err, result) {
        res.send(err ? 500 : 200, err || true);
    });
}

//
// Exports
//
exports.getFiles = getFiles;
exports.getFile = getFile;
exports.deleteFile = deleteFile;
exports.postFile = postFile;
