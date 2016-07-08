var EventProcessor = require('../eventProcessor.js').EventProcessor;
var util = require('util');
var bitdogClient = require('bitdog-client');
var constants = require('../constants.js');
var tingodb = require('tingodb')();


function Brain() {
    var db = new tingodb.Db('./database', {}, { memStore: false });
    db.createCollection('zwave_nodes', {}, function (err, collection) {
    });
}

util.inherits(Brain, EventProcessor);


Brain.prototype.onProcessMessage = function (message) {
    //bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_BRAIN, 'Analyzing message', message);

}

module.exports = new Brain();