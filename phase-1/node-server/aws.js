//
// Imports
//
var fs = require('fs');
var AWS = require('aws-sdk');

var logger = require('./logger').prefix('AWS');

//
// Constants
//
var S3_BUCKET = 'glsec-2014';

//
// Members
//
var s3;

//
// Functions
//
/**
 * Initializes AWS configuration
 */
function init(cb) {
    logger.info('Configuring AWS');

    // ensure they've build aws.json
    if (!fs.existsSync('./aws.json')) {
        return cb && cb('aws.json is not configured -- please see aws.json.sample');
    }

    // load config
    AWS.config.loadFromPath('./aws.json');

    // init services
    s3 = new AWS.S3();

    return cb && cb();
}

/**
 * Gets the specified S3 object
 *
 * @param string key Key (file name)
 * @param {function(err, data)} cb Callback
 */
function s3get(key, cb) {
    s3.getObject({
        Bucket: S3_BUCKET,
        Key: key
    }, cb);
}

//
// Exports
//
exports.init = init;
exports.s3get = s3get;
