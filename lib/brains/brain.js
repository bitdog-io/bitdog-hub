var EventProcessor = require('../eventProcessor.js').EventProcessor;
var util = require('util');
var path = require('path');
var bitdogClient = require('bitdog-client');
var constants = require('../constants.js');
var tingodb = require('tingodb')();
var databaseDirectoryPath = path.resolve(__dirname, '../database');


function Brain() {

    this.db = new tingodb.Db(databaseDirectoryPath, {}, { memStore: false });
    this.db.createCollection('zwaveNodesDb', {}, function (err, collection) {
        if (err != null) {
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_BRAIN, 'Error creating database collection', err);
            exit(1);
        } else {
            this.zwaveNodesDb = collection;
        }

    }.bind(this));
}

util.inherits(Brain, EventProcessor);


Brain.prototype.onProcessMessage = function (message) {
    this.zwaveNodesDb.insert(message, {}, function (err, result) {
        if (err != null) {
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_BRAIN, 'Error inserting data into collection', err);
        }
    }.bind(this));

}

module.exports = new Brain();