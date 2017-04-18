//-----------------------------------------------------------------------------
//
//	bitdogBrain.js
//
//	Copyright (c) 2015-2017 Bitdog LLC.
//
//	SOFTWARE NOTICE AND LICENSE
//
//	This file is part of bitdog-hub.
//
//	bitdog-hub is free software: you can redistribute it and/or modify
//	it under the terms of the GNU General Public License as published
//	by the Free Software Foundation, either version 3 of the License,
//	or (at your option) any later version.
//
//	bitdog-hub is distributed in the hope that it will be useful,
//	but WITHOUT ANY WARRANTY; without even the implied warranty of
//	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//	GNU General Public License for more details.
//
//	You should have received a copy of the GNU General Public License
//	along with bitdog-hub.  If not, see <http://www.gnu.org/licenses/>.
//
//-----------------------------------------------------------------------------

var EventEmitter = require('events').EventEmitter;

var util = require('util');
var path = require('path');
var bitdogClient = require('bitdog-client');
var constants = require('../constants.js');
var coreMessageSchemas = require('../coreMessageSchemas.js');
var tingodb = require('tingodb')();
var databaseDirectoryPath = path.resolve(__dirname, '../../database');


function BitdogBrain() {
    var _bitdogZWave = null;

    // Configure tingodb's folder setting
    this.db = new tingodb.Db(databaseDirectoryPath, {}, { memStore: false });

    // Create a file for zwave value persistence
    this.db.createCollection('zwaveValuesDb', {}, function (err, collection) {
        if (err != null) {
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_BRAIN, 'Error creating database collection zwaveValuesDb', err);
        } else {
            this.zwaveValuesDb = collection;
        }

    }.bind(this));

    // Create a file for zwave node configuration persistence
    this.db.createCollection('zwaveNodesDb', {}, function (err, collection) {
        if (err != null) {
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_BRAIN, 'Error creating database collection zwaveNodesDb', err);
        } else {
            this.zwaveNodesDb = collection;
        }

    }.bind(this));

    // Pass in the external zwave controller instance so that brain can send its own commands
    this.__defineGetter__('bitdogZWave', function () { return _bitdogZWave; });
    this.__defineSetter__('bitdogZWave', function (value) { _bitdogZWave = value; });

}

util.inherits(BitdogBrain, EventEmitter);

BitdogBrain.prototype.processMessage = function (message) {
    this.onProcessMessage(message);
}

BitdogBrain.prototype.onProcessMessage = function (message) {
    //bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_BRAIN, 'Processing message', message);
    // Process inbound and outbound messages 
    switch (message.h.c) {

        case 'data':
            {
                switch (message.h.n) {
                    case 'bd-zValueChanged':
                        this.updateZWaveValue(message);
                        break;

                    case 'bd-zNodeRemoved':
                        this.deleteZWaveNode(message);
                        break;

                }
            }
            break;

    }

}

BitdogBrain.prototype.parseValueId = function (valueId) {
    var values = valueId.split('-');
    var result = {
        nodeId: parseInt(values[0]),
        classId: parseInt(values[1]),
        instanceId: parseInt(values[2]),
        indexId: parseInt(values[3])
    };

    return result;
}

BitdogBrain.prototype.updateZWaveValue = function (message) {
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

BitdogBrain.prototype.deleteZWaveNode = function (message) {
    var homeId = message.d.homeId;
    this.deleteNode(homeId, message.d.nodeInfo);
}

BitdogBrain.prototype.deleteNode = function (homeId, nodeInfo) {
    self = this;

    self.zwaveNodesDb.remove({ homeId: homeId, nodeId: nodeInfo.id }, {}, function (err, record) {
        if (err != null) {
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_BRAIN, 'Problem with node:', node);
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_BRAIN, 'Error deleting data in zwaveNodesDb', err);
        }
    });
}


BitdogBrain.prototype.insertOrUpdateNode = function(homeId, node) {
    self = this;

    self.zwaveNodesDb.findOne({ homeId: homeId, nodeId: node.id }, {}, function (err, record) {
        if (err != null) {
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_BRAIN, 'Problem with node:', node);
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_BRAIN, 'Error finding data in zwaveNodesDb', err);
        }
        else {
            if (record != null && typeof record != typeof undefined) {
                self.zwaveNodesDb.update({ homeId: homeId, nodeId: node.id }, { homeId: homeId, nodeId: node.id, node: node }, function (err, result) {
                    if (err != null) {
                        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_BRAIN, 'Error updating data in zwaveNodesDb', err);
                    }

                });
            }
            else {
 
                self.zwaveNodesDb.insert({ homeId: homeId, nodeId: node.id, node: node }, {}, function (err, result) {
                     if (err != null) {
                        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_BRAIN, 'Problem with node:', node);
                        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_BRAIN, 'Error inserting data into zwaveNodesDb', err);
                    }
                });

                self.emit('node added', node.getNodeInformation());

                bitdogClient.sendData('bd-zNodeFound', coreMessageSchemas.zwaveNodeMessageSchema, function (message) {
                    message.homeId = homeId;
                    message.nodeInfo = node.getNodeInformation();
                });
            }
        }

    });
}

BitdogBrain.prototype.getZWaveValue = function (homeId, nodeId, classId, instanceId, index) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var id = homeId + '-' + nodeId + '-' + classId + instanceId + '-' + index;
        self.zwaveValuesDb.findOne({ id: id }, {}, function (err, record) {
            if (err == null) {
                resolve(record);
            } else {
                reject(err);
            }

        });
    });

}

BitdogBrain.prototype.getZWaveNode = function (homeId, nodeId) {
    var self = this;
    return new Promise(function (resolve, reject) {
        self.zwaveNodesDb.findOne({ homeId: homeId, nodeId: nodeId }, {}, function (err, record) {
            if (err == null) {
                resolve(record);
            } else {
                reject(err);
            }

        });
    });

}
//-------------------------------------------------------------------------------------

BitdogBrain.prototype.setTemperature = function (homeId, nodeId, celsius) {
    var coolingSetpointValue = this.getZWaveValue(homeId, nodeId, 67, 1, 2);
    var heatingSetpointValue = this.getZWaveValue(homeId, nodeId, 67, 1, 1); 
    var fahrenheit = ((c * 9) / 5) + 32;

    Promise.all([coolingSetpointValue, heatingSetpointValue]).then(function (values) {
        var coolingValue = values[0];
        var heatingValue = values[1];

        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_BRAIN, 'Current themostat setpoint values', { homeId: homeId, nodeId: nodeId, cooling: coolingValue, heatingValue: heatingValue });

        // Currently setting both setpoints when this generic command is called
        if (coolingValue.unit === 'F' || heatingValue.unit === 'F') {
            bitdogZWave.setValue(nodeId, 67, 1, 2, fahrenheit);
            bitdogZWave.setValue(nodeId, 67, 1, 1, fahrenheit);

        } else {
            bitdogZWave.setValue(nodeId, 67, 1, 2, celsius);
            bitdogZWave.setValue(nodeId, 67, 1, 1, celsius);
        }
            

    });
}


module.exports = new BitdogBrain();