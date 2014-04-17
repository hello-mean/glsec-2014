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
    logger.info('S3 get: ' + key);

    s3.getObject({
        Bucket: S3_BUCKET,
        Key: key
    }, cb);
}

/**
 * Gets the specified S3 object
 *
 * @param string prefix Prefix
 * @param {function(err, data)} cb Callback
 */
function s3list(prefix, cb) {
    logger.info('S3 list: ' + prefix);

    s3.listObjects({
        Bucket: S3_BUCKET,
        Prefix: prefix,
        Delimiter: '/'
    }, cb);
}

/**
 * Deletes the specified S3 object
 *
 * @param string key Key (file name)
 * @param {function(err, data)} cb Callback
 */
function s3delete(key, cb) {
    logger.info('S3 delete: ' + key);

    s3.deleteObject({
        Bucket: S3_BUCKET,
        Key: key
    }, cb);
}

/**
 * Adds an object to S3
 *
 * @param string key Key (file name)
 * @param {function(err, data)} cb Callback
 */
function s3put(key, contents, cb) {
    logger.info('S3 put: ' + key);

    s3.putObject({
        Bucket: S3_BUCKET,
        Key: key,
        Body: contents
    }, cb);
}

//
// Exports
//
exports.init = init;
exports.s3get = s3get;
exports.s3list = s3list;
exports.s3delete = s3delete;
exports.s3put = s3put;