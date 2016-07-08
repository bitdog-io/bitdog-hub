var EventProcessor = require('../eventProcessor.js').EventProcessor;
var util = require('util');
var path = require('path');
var bitdogClient = require('bitdog-client');
var constants = require('../constants.js');
var tingodb = require('tingodb')();
var databaseDirectoryPath = path.resolve(__dirname, '../database');


function Brain() {

    this.db = new tingodb.Db(databaseDirectoryPath, {}, { memStore: false });
    this.db.createCollection('zwave_nodes', {}, function (err, collection) {
        if (err != null) {
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_BRAIN, 'Error creating database collection', err);
            exit(1);
        }

    });
}

util.inherits(Brain, EventProcessor);


Brain.prototype.onProcessMessage = function (message) {
    //bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_BRAIN, 'Analyzing message', message);

}

module.exports = new Brain();