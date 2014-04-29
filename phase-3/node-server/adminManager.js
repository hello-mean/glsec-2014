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

// S3 pricing as of 2014-04 (or something)
var COST_PER_HIT = 0.00004;
var COST_PER_BYTE = 0.00000000003;

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

var instances = 0;

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

    // by default clients are not load balancers
    socket.lb = false;

    socket.logger.info('New connection');

    socket.on('disconnect', function() {
        socket.logger.info('Disconnected');

        if (socket.lb) {
            instances--;
			sendStats();
        }

        if (sockets[socket.id]) {
            delete sockets[socket.id];
            socketCount--;
        }
    });

    socketCount++;

    sockets[socket.id] = socket;

    //
    // Events
    //
    socket.on('log', function(data) {
        if (socket.lb) {
            data.msg = '[' + socket.id + '] ' + data.msg;
            push('log', data);
        }
    });

    socket.on('api', function(data) {
        if (socket.lb) {
            push('api', data);
        }
    });

    socket.on('hit', function(data) {
        if (socket.lb) {
             hit(data);
        }
    });

    socket.on('lb', function(data) {
        // this is a load balanced instance
        socket.lb = true;
        instances++;

        // notify everyone
        sendStats();
    });

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
        uptime: +(new Date) - startTime,
        instances: instances
    });
}

/**
 * Sends stats and resets the interval
 */
function sendStatsAndReset() {
    sendStats();

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
            msg: msg
        });
    });

    //
    // Start the periodic stats emitter
    //
    setInterval(sendStatsAndReset, STATS_PERIOD);

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

        // only emit to non-loadbalanced instances
        if (socket.lb === false) {
            socket.emit(cmd, data);
        }
    }
}

/**
 * Logs an AWS command
 *
 * @param bytes Bytes transferred
 */
function hit(newBytes) {
    totalHits++;
    hits++;

    totalBytes += newBytes;
    bytes += newBytes;

    var newCost = (COST_PER_HIT + COST_PER_BYTE * newBytes);

    totalCost += newCost;
    cost += newCost;
}

//
// Exports
//
exports.init = init;
exports.push = push;
exports.hit = hit;
