//
// Imports
//
var io = require('socket.io-client');
var constants = require('./constants');
var logger = require('./logger');

//
// socket.io connection and events
//

// connect to the Acrophobes server
logger.info('Connecting to ' + constants.API_SERVER);

var client = io.connect(constants.API_SERVER);
client.on('connect', function() {
    logger.info('Connected');

    //
    // Pretends to get random hits
    //
    setInterval(function() {

        //
        // 10% chance of a log event
        //
        if (randomChance(0.2)) {
            client.emit('log', {
                level: 'info',
                msg: 'Blah blah blah'
            });
        }

        //
        // 33% chance of an API call event
        //
        if (randomChance(0.5)) {
            client.emit('api', {
                method: 'GET',
                route: '/api/fake'
            });
        }

        //
        // 50% chance of a hit
        //
        client.emit('hit', randomNumber(0, 1000000));
    }, 100);
});

client.on('error', function(data) {
    logger.error(data);
    process.exit();
});

client.on('disconnect', function() {
    logger.error('Disconnected');
    process.exit();
});

//
// override emit and on ($emit) so we get all incoming/outgoing messages
//
var emit = client.emit;
client.emit = function() {
    if (arguments[0] !== 'newListener') {
        var cmdName = arguments[0];
        var args = arguments[1] ? JSON.stringify(arguments[1]) : '';

        logger.debug('-> [' + cmdName + '] ' + args);
    }

    emit.apply(client, arguments);
};

var $emit = client.$emit;
client.$emit = function() {
    if (arguments[0] !== 'newListener') {
        var cmdName = arguments[0];
        var args = arguments[1] ? JSON.stringify(arguments[1]) : '';

        logger.debug('<- [' + cmdName + '] ' + args);
    }

    $emit.apply(client, arguments);
};

/**
 * Random chance
 */
function randomChance(chance) {
    var max = 1 / chance;

    return randomNumber(0, max);
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
