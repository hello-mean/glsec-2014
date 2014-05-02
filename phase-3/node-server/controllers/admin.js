/**
 * Admin REST api
 *
 * Also owns fake test instances
 */
//
// Imports
//
var aws = require('../aws');
var fs = require('fs');
var async = require('async');

var logger = require('../logger').prefix('/api/todo');
var adminManager = require('../adminManager');
var workerInstance = require('../workerInstance');

/*
 * Admin routes:
 *
 * POST /api/admin/instances/increase Adds an instance
 * POST /api/admin/instances/decrease Removes an instance
 */

//
// Members
//
var instances = [];
var instanceCount = 0;

//
// Routes
//
/**
 * POST /api/admin/instances/increase
 */
function postInstanceIncrease(req, res) {
    instanceCount++;

    // NOTE: If you were using Amazon EC2 or Azure for Node.js instances,
    // you could interact with the Amazon aws-sdk or azure-sdk-for-node.

    workerInstance.init(instanceCount, function(instance) {
        instances.push(instance);
    });

    res.send(true);
}

/**
 * POST /api/admin/instances/decrease
 */
function postInstanceDecrease(req, res) {
    if (instanceCount == 0) {
        res.send(500, 'No more instances');
        return;
    }

    var instance = instances.pop();
    instanceCount--;

    // NOTE: If you were using Amazon EC2 or Azure for Node.js instances,
    // you could interact with the Amazon aws-sdk or azure-sdk-for-node.

    instance.disconnect();

    res.send(true);
}

//
// Exports
//
exports.postInstanceIncrease = postInstanceIncrease;
exports.postInstanceDecrease = postInstanceDecrease;
