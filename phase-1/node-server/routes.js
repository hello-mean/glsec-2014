//
// Imports
//

// controllers
var todoController = require('./controllers/todo');

// misc
var logger = require('./logger').prefix('HTTP Routes');

/**
 * Sets up routes for the app
 *
 * @param app Express application
 * @param {function(err)} callback Callback
 */
function setup(app, callback) {
    logger.info('Setting up routes');

    //
    // API
    //

    // Todo routes
    app.get('/api/todo/:id/files', todoController.getFiles);
    app.get('/api/todo/:id/file/:name', todoController.getFile);
    app.del('/api/todo/:id/file/:name', todoController.deleteFile);
    app.post('/api/todo/:id/files', todoController.postFile);

    callback && callback();
}

//
// Exports
//
exports.setup = setup;