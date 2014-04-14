//
// Imports
//
var async = require('async');

var constants = require('./constants');
var logger = require('./logger').prefix('Server');
var httpSrv = require('./http-server');
var aws = require('./aws');

//
// Members
//
var httpServer;

// log startup
function start() {
    logger.info('v' + constants.VERSION + ' starting up');
    logger.info('Environment: ' + constants.ENV);

    // mongoose startup
    async.series([
        function(cb) {
            aws.init(cb);
        },
        function(cb) {
            httpSrv.listen(function(err, newHttpServer) {
                httpServer = newHttpServer;
                cb();
            });
        }
    ],
    function(err) {
        // bail on error
        if (err) {
            logger.error(err);
            logger.error('Exiting');
            return;
        }

        logger.info('Startup completed');
    });
}

//
// Exports
//
exports.start = start;