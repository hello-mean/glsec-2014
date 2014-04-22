//
// Imports
//

// controllers
var homeController = require('./controllers/home');
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
    
    // Home routes
    app.get('/', homeController.get);

    // Todo routes
    app.get('/api/todo/:id/files', todoController.getFiles);
    app.options('/api/todo/:id/files', function(req, res) { res.send(200); });
    app.get('/api/todo/:id/file/:name', todoController.getFile);
    app.options('/api/todo/:id/file/:name', function(req, res) { res.send(200); })
    app.del('/api/todo/:id/file/:name', todoController.deleteFile);
    app.post('/api/todo/:id/files', todoController.postFile);

    callback && callback();
}

//
// Exports
//
exports.setup = setup;