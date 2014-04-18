//
// Imports
//
var http = require('http');
var express = require('express');
var fs = require('fs');
var async = require('async');

var constants = require('./constants');
var logger = require('./logger').prefix('HTTP');
var routes = require('./routes');

//
// Members
//
var app;
var httpServer;

var webDir = __dirname + '/';
var publicDir = webDir + 'public/';

/**
 * Begin listening for HTTP connections
 *
 * @param {function(err, http.Server)} callback callback
 */
function listen(callback) {
    logger.info('Initializing express');

    // startup the HTTP server
    app = express();

    logger.info('Creating HTTP server');
    httpServer = http.createServer(app);

    async.waterfall([
        function(cb) {
            app.use(express.cookieParser());
            app.use(express.bodyParser());
            app.use(express.methodOverride());

            //
            // app locals
            //
            app.use(express.cookieSession(
            {
                secret: 'GLSEC2014',
                cookie: { maxAge: 60 * 60 * 1000 }
            }));

            // logs
            var logDir = webDir + 'logs/';

            var logFile = fs.createWriteStream(logDir + 'http.log', {flags: 'a'});
            app.use(express.logger({
                format: 'default',
                stream: logFile
            }));

            //
            // Static files
            //
            app.use(express.static(publicDir));

            // For IISnode, use PORT environment variable
            var port = process.env.PORT ? process.env.PORT : constants.SERVER_PORT;
            
            // listen for connection
            logger.info('Starting HTTP server on port ' + port);
            httpServer.listen(constants.SERVER_PORT);

            cb();
        },
        function(cb) {
            routes.setup(app, function(err) {
                cb(err);
            });
        }
    ],
    function(err) {
        if (callback) {
            callback(err, httpServer);
        }
    });
}

/**
 * Gets the HTTP server
 *
 * @return http.Server
 */
function getApp() {
    return app;
}

//
// Exports
//
exports.listen = listen;
exports.getServer = getApp;
