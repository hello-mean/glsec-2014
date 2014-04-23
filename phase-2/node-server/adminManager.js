/**
 * Admin Manager
 *
 * The Admin Manager broadcasts realtime events and periodic stats to any logged-in admins
 *
 * The current events are:
 * 1) Log events (real time)
 *  log { level: 'info', msg: 'msg' }
 *
 * 2) API hits (real time)
 *  api { method: 'GET', url: '/api/foo' }
 *
 * 3) General interval statistics (periodic push)
 *  stats { hits: 10, bytes: 50000, users: 2, cost: 100.00, period: 5,
 *          uptime: 100, totalHits: 1000, totalBytes: 1000000, totalCost: 10000.00 }
 */

//
// Imports
//
var logger = require('./logger').prefix('Admin Manager');

//
// Constants
//
var STATS_PERIOD = 5000;

//
// Members
//

// sockets
var sockets = {};
var socketCount = 0;

// stats
var totalHits = 0;
var hits = 0;

var totalBytes = 0;
var bytes = 0;

var totalCost = 0.0;
var cost = 0.0;

var startTime = 0;

//
// Private Functions
//
/**
 * Handles a new Socket.IO connection
 *
 * @param {Socket.IO} socket Socket.IO connection
 */
function handleConnection(socket) {
    socket.logger = require('./logger').prefix('Socket.IO - ' +  socket.id);

    socket.logger.info('New connection');

    socket.on('disconnect', function() {
        socket.logger.info('Disconnected');

        if (sockets[socket.id]) {
            delete sockets[socket.id];
            socketCount--;
        }
    });

    socketCount++;

    sockets[socket.id] = socket;

    // send stats right away
    sendStats();
}

/**
 * Sends server stats to all Admins
 */
function sendStats() {
    push('stats', {
        hits: hits,
        totalHits: totalHits,
        bytes: bytes,
        totalBytes: totalBytes,
        cost: cost,
        totalCost: totalCost,
        period: STATS_PERIOD,
        uptime: +(new Date) - startTime
    });

    hits = 0;
    bytes = 0;
    cost = 0;
}

//
// Public Functions
//

/**
 * Initializes the Admin Manager
 *
 * @param socketIoServer Socket.IO server
 * @param {function(err)} callback Callback
 */
function init(socketIoServer, callback) {
    logger.info('Starting');

    socketIoServer.sockets.on('connection', handleConnection);

    startTime = +(new Date);

    //
    // Broadcast all log events to our Socket IO listeners
    //
    logger.on('logging', function(transport, level, msg, meta) {
        push('log', {
            level: level,
            msg: msg,
            meta: meta
        });
    });

    //
    // Start the periodic stats emitter
    //
    setInterval(sendStats, STATS_PERIOD);

    logger.info('Started successfully');

    callback && callback(null);
}

/**
 * Pushes an event to all admins
 *
 * @param {string} cmd Command name
 * @param {object} data Payload
 */
function push(cmd, data) {
    for (var socketId in sockets) {
        var socket = sockets[socketId];

        socket.emit(cmd, data);
    }
}

//
// Exports
//
exports.init = init;
exports.push = push;
