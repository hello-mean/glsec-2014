//
// Imports
//
var socketIo = require('socket.io');

var logger = require('./logger').prefix('Socket.IO');

//
// Members
//
var io;

//
// Private Functions
//

//
// Public Functions
//
/**
 * Initializes the Socket.IO server
 *
 * @param httpServer HTTP server
 * @param {function(err, io)} callback Callback
 */
function init(httpServer, callback) {
    logger.info('Starting');

    io = socketIo.listen(httpServer);

    // enable all transports (incl flashsocket for ie9)
    io.set('transports', [
        'websocket',
        'flashsocket',
        'htmlfile',
        'xhr-polling',
        'jsonp-polling',
    ]);

    io.set('log level', 2); // info

    // js optimization
    io.enable('browser client minification');
    io.enable('browser client etag');
    io.enable('browser client gzip');

    logger.info('Started successfully');

    callback && callback(null, io);
}

//
// Exports
//
exports.init = init;
