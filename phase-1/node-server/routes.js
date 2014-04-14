//
// Imports
//

// controllers
var storageController = require('./controllers/storage');

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
    app.get('/api/storage', storageController.get);

    callback && callback();
}

//
// Exports
//
exports.setup = setup;