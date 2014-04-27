//
// Imports
//
var async = require('async');

var constants = require('./constants');
var logger = require('./logger').prefix('Server');
var httpSrv = require('./http-server');
var socketIoSrv = require('./socketIoServer');
var adminManager = require('./adminManager');
var aws = require('./aws');

//
// Members
//
var httpServer;
var socketIoServer;

var requestHandler = function(req) {
  adminManager.push('api', {
    path: req.path,
    method: req.method
  });
};

// log startup
function start() {
    logger.info('v' + constants.VERSION + ' starting up');
    logger.info('Environment: ' + constants.ENV);

    process.on('uncaughtException', function (err) {
        logger.error(err);
    });

    async.series([
        function(cb) {
            aws.init(cb);
        },
        function(cb) {
            httpSrv.listen(requestHandler, function(err, newHttpServer) {
                httpServer = newHttpServer;
                cb(err);
            });
        },
        function(cb) {
            socketIoSrv.init(httpServer, function(err, newSocketServer) {
                socketIoServer = newSocketServer;
                cb(err);
            });
        },
        function(cb) {
            adminManager.init(socketIoServer, cb);
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
