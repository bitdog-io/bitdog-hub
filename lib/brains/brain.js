var EventProcessor = require('../eventProcessor.js').EventProcessor;
var util = require('util');
var path = require('path');
var bitdogClient = require('bitdog-client');
var constants = require('../constants.js');
var tingodb = require('tingodb')();
var databaseDirectoryPath = path.resolve(__dirname, '../../database');


function Brain() {

    this.db = new tingodb.Db(databaseDirectoryPath, {}, { memStore: false });
    this.db.createCollection('zwaveValuesDb', {}, function (err, collection) {
        if (err != null) {
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_BRAIN, 'Error creating database collection zwaveValuesDb', err);
        } else {
            this.zwaveValuesDb = collection;
        }

    }.bind(this));

    this.db.createCollection('zwaveNodesDb', {}, function (err, collection) {
        if (err != null) {
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_BRAIN, 'Error creating database collection zwaveNodesDb', err);
        } else {
            this.zwaveNodesDb = collection;
        }

    }.bind(this));
}

util.inherits(Brain, EventProcessor);


Brain.prototype.onProcessMessage = function (message) {
    var self = this;

    if (message.h.n === 'bd-zValueChanged') {
        var key = message.d.homeId + '-' + message.d.valueId;

        self.zwaveValuesDb.findOne({ id: key }, {}, function (record) {
            if (record != null) {
                self.zwaveValuesDb.update({ _id: record._id }, { id: key, value: message.h.d.value, date: Date.now() }, function (err, result) {
                    if (err != null) {
                        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_BRAIN, 'Error updating data in zwaveValuesDb', err);
                    }

                });
            }
            else {
                self.zwaveValuesDb.insert({ id: key, value: message.h.d.value, date: Date.now() }, {}, function (err, result) {
                    if (err != null) {
                        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_BRAIN, 'Error inserting data into zwaveValuesDb', err);
                    }
                });
            }

        });
    }

}

module.exports = new Brain();