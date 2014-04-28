//
// Imports
//
var path = require('path');

//
// app
//

/**
 * App version
 */
exports.VERSION = 1;

/**
 * Environment
 */
exports.ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'production';

/**
 * Whether or not this is a production environment
 */
exports.IS_PRODUCTION = exports.ENV === 'production';

//
// server-related
//
/**
 * HTTP / Socket.IO server port
 */
exports.SERVER_PORT = exports.IS_PRODUCTION ? 80 : 3001;

/**
 * HTTP / Socket.IO server IP
 */
exports.SERVER_IP = '127.0.0.1';

/**
 * Server URL
 */
exports.SERVER_URL = 'http://' + exports.SERVER_IP + ':' + exports.SERVER_PORT;

/**
 * App domain
 */
exports.DOMAIN = 'foofactory.net';

/**
 * API server URL
 */
exports.API_SERVER = exports.IS_PRODUCTION ? 'http://api.foofactory.net' : exports.SERVER_URL;