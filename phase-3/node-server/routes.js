//
// Imports
//

// controllers
var homeController = require('./controllers/home');
var todoController = require('./controllers/todo');
var adminController = require('./controllers/admin');

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
    app.get('/api/todo/:id/file/:name', todoController.getFile);
    app.del('/api/todo/:id/file/:name', todoController.deleteFile);
    app.post('/api/todo/:id/files', todoController.postFile);
	
	// Admin routes
	app.post('/api/admin/instances/increase', adminController.postInstanceIncrease);
	app.post('/api/admin/instances/decrease', adminController.postInstanceDecrease);

    callback && callback();
}

//
// Exports
//
exports.setup = setup;