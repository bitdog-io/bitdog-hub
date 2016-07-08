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

    switch (message.h.c) {
        case 'zwaveConfiguration':
            this.updateZWaveNodes(message);
            break;
        case 'data':
            {
                switch (message.h.n) {
                    case 'bd-zValueChanged':
                        this.updateZWaveValue(message);
                        break;

                }
            }
            break;

    }

}

Brain.prototype.updateZWaveValue = function (message) {
    var self = this;
    var key = message.d.homeId + '-' + message.d.valueId;

    self.zwaveValuesDb.findOne({ id: key }, {}, function (err, record) {
        if (err != null) {
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_BRAIN, 'Error finding data in zwaveValuesDb', err);
        }
        else {

            if (record != null && typeof record != typeof undefined) {
                self.zwaveValuesDb.update({ _id: record._id }, { id: key, value: message.d.value }, function (err, result) {
                    if (err != null) {
                        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_BRAIN, 'Error updating data in zwaveValuesDb', err);
                    }

                });
            }
            else {
                self.zwaveValuesDb.insert({ id: key, value: message.d.value }, {}, function (err, result) {
                    if (err != null) {
                        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_BRAIN, 'Error inserting data into zwaveValuesDb', err);
                    }
                });
            }
        }

    });
}

Brain.prototype.updateZWaveNodes = function (message) {
    var self = this;
    var homeId = message.d.c.homeId;

    for (var index = 0; index < message.d.c.nodes.length; index++) {
        var node = message.d.c.nodes[index];

        if (node.ready === true) {
            self.zwaveNodesDb.findOne({ homeId: homeId, id: node.id }, {}, function (err, record) {
                if (err != null) {
                    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_BRAIN, 'Error finding data in zwaveNodesDb', err);
                }
                else {

                    if (record != null && typeof record != typeof undefined) {
                        self.zwaveNodesDb.update({ homeId: homeId, id: node.id }, node, function (err, result) {
                            if (err != null) {
                                bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_BRAIN, 'Error updating data in zwaveNodesDb', err);
                            }

                        });
                    }
                    else {
                        self.zwaveNodesDb.insert(node, {}, function (err, result) {
                            if (err != null) {
                                bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_BRAIN, 'Error inserting data into zwaveNodesDb', err);
                            }
                        });
                    }
                }

            });
        }

    }
}

module.exports = new Brain();