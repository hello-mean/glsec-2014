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
 * CORS middleware
 */
function allowCrossDomain(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');

    // authorize all OPTIONS requests
    if (req.method === 'OPTIONS') {
        res.send(200);
    } else {
        next();
    }
}

/**
 * Begin listening for HTTP connections
 *
 * @param {function(err, http.Server)} callback callback
 */
function listen(reqHandler, callback) {
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

            app.use(allowCrossDomain);

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

            // Hook for all requests coming through
            if (reqHandler) {
              app.use(function(req, res, next) {
                reqHandler(req);
                next();
              });
            }

            // For IISnode, use PORT environment variable
            var port = process.env.PORT ? process.env.PORT : constants.SERVER_PORT;

            // listen for connection
            logger.info('Starting HTTP server on port ' + port);
            httpServer.listen(port);

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
