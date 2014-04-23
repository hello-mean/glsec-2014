//
// Imports
//
var winston = require('winston');
var _ = require('lodash-node');

var transports = [];

// Console errors always
transports.push(new winston.transports.Console({
    handleExceptions: true,
    prettyPrint: true,
    level: 'debug',
    timestamp: true,
    colorize: true
}));

// create a logger to the console
var logger = new (winston.Logger)({
    transports: transports
});

/**
 * An optional method that creates a new logger that
 * always outputs a prefix before the message.
 *
 * For example:
 *  [prefix] msg
 *
 * The logger only has info(), warn() and error() functions.
 *
 * @param {string} prefix Prefix before message
 *
 * @return {object} Prefixed logger object
 */
logger.prefix = function(prefix) {
    var prefixedLogger = {};

    prefixedLogger.logFn = function() {
        var logFunction = arguments[0];
        if (logFunction) {
            var prefixArg = ['[' + prefix + ']'];
            var args = prefixArg.concat(Array.prototype.slice.call(arguments[1]));

            logFunction.apply(logger, [args.join(' ')]);
        }
    };

    prefixedLogger.info = function() {
        prefixedLogger.logFn(logger.info, arguments);
    };

    prefixedLogger.warn = function() {
        prefixedLogger.logFn(logger.warn, arguments);
    };

    prefixedLogger.error = function() {
        prefixedLogger.logFn(logger.error, arguments);
    };

    prefixedLogger.debug = function() {
        prefixedLogger.logFn(logger.debug, arguments);
    };

    prefixedLogger.errorChecker = function(err) {
        if (err) {
            prefixedLogger.error(err);
        }
    };

    // let the prefixed logger have EventEmitter bindings
    prefixedLogger.on = _.bind(logger.on, logger);

    return prefixedLogger;
};

//
// Exports
//
module.exports = logger;