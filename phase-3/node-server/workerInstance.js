//
// Imports
//
var io = require('socket.io-client');
var constants = require('./constants');

//
// socket.io connection and events
//
function init(idx, callback) {
    var logger = require('./logger').prefix('LB #' + idx);
    
    // connect to the master server
    logger.info('Connecting to ' + constants.API_SERVER);

    var client = io.connect(constants.API_SERVER, 
    {
        'force new connection': true
    });
    
    client.on('connect', function() {
        logger.info('Connected');

        // tell the socket.io server that we're a loadbalanced instance
        client.emit('lb');

        //
        // Pretends to get random hits
        //
        setInterval(function() {
            //
            // 1% chance of a log event
            //
            if (randomChance(0.01)) {
                client.emit('log', {
                    level: 'info',
                    msg: 'Blah blah blah ' + randomNumber(0, 1000)
                });
            }

            //
            // 33% chance of an API call event
            //
            if (randomChance(0.33)) {
                client.emit('api', {
                    method: 'GET',
                    path: '/api/todo/' + randomNumber(0, 100) + '/files/'
                });
            }

            //
            // 100% chance of a hit
            //
            client.emit('hit', randomNumber(0, 1000000));
        }, 250);
    });

    client.on('error', function(data) {
        logger.error(data);
    });

    client.on('disconnect', function() {
        logger.warn('Disconnected');
    });
    
    callback && callback(client);
}

/**
 * Random chance
 */
function randomChance(chance) {
    var max = 1 / chance;

    return randomNumber(0, max) == 0;
}

/**
 * Random number between min and max.
 *
 * @param {number} min Min
 * @param {number} max Max
 *
 * @returns {number} Random number between min and max
 */
function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//
// Exports
//
exports.init = init;