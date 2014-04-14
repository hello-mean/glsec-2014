//
// Imports
//
var aws = require('../aws');

/**
 * GET /api/storage
 *
 * TODO
 */
function get(req, res) {
    aws.s3get(
        'test.txt',
        function(err, data) {
            if (err) {
                res.send(500, err);
            }

            var buff = new Buffer(data.Body, "binary");
            res.send(buff);
        });
}

//
// Exports
//
exports.get = get;