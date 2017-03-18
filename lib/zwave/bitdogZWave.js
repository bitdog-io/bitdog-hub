//-----------------------------------------------------------------------------
//
//	bitdogZWave.js
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


var ZWave = require('openzwave-shared');
var ZWaveHome = require('./zwaveHome.js');
var EventEmitter = require('events').EventEmitter;


var os = require('os');
var url = require('url');
var https = require('https');
var http = require('http');
var util = require('util');


var coreMessageSchemas = require('../coreMessageSchemas.js');
var constants = require('../constants.js');
var zwave = null;
var zwaveHome = new ZWaveHome();
var bitdogBrain = require('../brains/bitdogBrain.js');


function BitdogZWave(bitdogClient) {
    var self = this;
    var _scanComplete = false;
    var _zwaveConfiguration = {
        ConsoleOutput: false,
        Logging: true,
        SaveConfiguration: true,
        DriverMaxAttempts: 3,
        PollInterval: 500,
        Associate: true
    };
    var _isReady = false;

    var logFormatter = function (category, text, arg) {
        if (arg instanceof Object) {
            if (typeof arg.d !== typeof undefined && arg.d !== null) {

                if (typeof arg.d.nodeId !== typeof undefined && arg.d.nodeId !== null) {
                    var zwaveNode = zwaveHome.getNode(arg.d.nodeId);

                    if (zwaveNode !== null) {
                        var newLogObject = { message: arg, node: zwaveNode.displayName };
                        return text + os.EOL + JSON.stringify(newLogObject, null, 2); 
                    }
                } else if (typeof arg.d.valueId !== typeof undefined && arg.d.valueId != null) {
                    var valueId = bitdogBrain.parseValueId(arg.d.valueId);
                    var zwaveNode = zwaveHome.getNode(valueId.nodeId);
                    if (zwaveNode != null) {
                        var newLogObject = { message: arg, node: zwaveNode.displayName };
                        var zwaveClass = zwaveNode.getClass(valueId.classId);
                        if (zwaveClass != null) {
                            newLogObject.class = zwaveClass.name;

                            var zwaveValue = zwaveClass.getValue(valueId.instanceId, valueId.indexId);

                            if (zwaveValue != null) {
                                newLogObject.valueLabel = zwaveValue.label;
                            }

                        }

                       return text + os.EOL + JSON.stringify(newLogObject, null, 2); 

                    }
 
                }
            }
        }
    }

    bitdogClient.logger.addLogFormatter(logFormatter);

    var networkKey = bitdogClient.configuration.get(constants.ZWAVE_NETWORKKEY_CONFIG);

    if (typeof networkKey === typeof undefined || networkKey === null || networkKey == '') {
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Automatically generating network key', _zwaveConfiguration);

            var buffer = require('crypto').randomBytes(32);
            var token = buffer.toString('hex');
            networkKey = '';

            for (var index = 0; index < 32; index += 2) {
                networkKey += '0x' + (token[index] + token[index + 1]).toUpperCase();
                if (index != 30)
                    networkKey += ',';
            }

            bitdogClient.configuration.set(constants.ZWAVE_NETWORKKEY_CONFIG, networkKey);

    }

    _zwaveConfiguration.NetworkKey = networkKey;

    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Setting configuration', _zwaveConfiguration);

    zwave = new ZWave(_zwaveConfiguration);

    zwave.on('node added', function (nodeId) {
        var zwaveNode = zwaveHome.createNode(nodeId, zwave);
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Node added', { zwaveNode: zwaveNode });

    });

    zwave.on('node removed', function (nodeId) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Node removed', { zwaveNode: zwaveNode });

        var zwaveNode = zwaveHome.removeNode(nodeId);

        bitdogClient.sendData('bd-zNodeRemoved', coreMessageSchemas.zwaveNodeMessageSchema, function (message) {
            message.homeId = zwaveHome.homeId;
            message.node = zwaveNode;
        });

        if (_scanComplete === true)
            sendZwaveConfigurationMessages();


    });

    zwave.on('value added', function (nodeId, commandClassId, zwaveValueInfo) {
        if (zwaveHome.updateValue(nodeId, zwaveValueInfo) === true) {
            bitdogClient.sendData('bd-zValueChanged', coreMessageSchemas.zwaveValueMessageSchema, function (message) {
                message.homeId = zwaveHome.homeId;
                message.valueId = zwaveValueInfo.value_id;
                message.value = zwaveValueInfo.value;
                message.classId = commandClassId;
                message.nodeId = nodeId;
                message.instanceId = zwaveValueInfo.instance;
                message.indexId = zwaveValueInfo.index;
                message.status = zwaveValueInfo.status
            });

        }
    });

    zwave.on('value changed', function (nodeId, commandClassId, zwaveValueInfo) {
        if (zwaveHome.updateValue(nodeId, zwaveValueInfo) === true) {
            bitdogClient.sendData('bd-zValueChanged', coreMessageSchemas.zwaveValueMessageSchema, function (message) {
                message.homeId = zwaveHome.homeId;
                message.valueId = zwaveValueInfo.value_id;
                message.value = zwaveValueInfo.value;
                message.classId = commandClassId;
                message.nodeId = nodeId;
                message.instanceId = zwaveValueInfo.instance;
                message.indexId = zwaveValueInfo.index;
                message.status = zwaveValueInfo.status
            });
        }
    });

    zwave.on('value removed', function (nodeId, commandClassId, instanceId, index) {
        zwaveHome.removeValue(nodeId, commandClassId, instanceId, index);
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Value removed', { zwaveNode: nodeId, zwaveClass: commandClassId, zwaveInstance: instanceId, zwaveIndex: index });
    });

    zwave.on('driver ready', function (homeId) {
        zwaveHome.homeId = homeId;
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Scanning, home id is', homeId.toString(16));
    });

    zwave.on('driver failed', function () {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Failed to start driver');
        zwave.disconnect();
        process.exit(1);
    });

    zwave.on('scan complete', function () {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Scan complete');
        sendZwaveConfigurationMessages();
        _scanComplete = true;

        setReady(true);

    });

    zwave.on('node available', function (nodeId, zwaveNodeInfo) {
        var zwaveNode = zwaveHome.setNodeInformation(nodeId, zwaveNodeInfo, false);
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Node available', { nodeId: nodeId, zwaveNode: zwaveNode });
    });

    zwave.on('node ready', function (nodeId, zwaveNodeInfo) {
        var zwaveNode = zwaveHome.setNodeInformation(nodeId, zwaveNodeInfo, true);
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Node ready', { zwaveNode: zwaveNode, zwaweNodeInfo: zwaveNodeInfo });

        bitdogBrain.getZWaveNode(zwaveHome.homeId, zwaveNode.id).then(function (record) {

            if (record != null) {
                bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Found node record', record);

                zwaveNode.name = record.node.name;
                zwaveNode.location = record.node.location;
            }

        }, function (error) {
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Error with database lookup', error);
        });

        if (_scanComplete === true)
            sendZwaveConfigurationMessages();


    });

    zwave.on('scene event', function (nodeId, sceneId) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Scene event', { homeId: zwaveHome.homeId,  nodeId: nodeId, sceneId: sceneId });
        bitdogClient.sendData('bd-zSceneEvent', coreMessageSchemas.zwaveSceneEventMessageSchema, function (message) {
            message.homeId = zwaveHome.homeId;
            message.nodeId = nodeId;
            message.value = sceneId;
        });
    });

    zwave.on('notification', function (nodeId, notif) {
        var message = 'Node' + nodeId + ': ';
        switch (notif) {
            case 0:
                message += 'Message complete';
                break;
            case 1:
                message += 'Timeout';
                zwaveHome.setNodeStatus(nodeId, 'Awake');
                bitdogClient.sendData('bd-zNodeStatus', coreMessageSchemas.zwaveNodeStatusMessageSchema, function (message) {
                    message.homeId = zwaveHome.homeId;
                    message.nodeId = nodeId;
                    message.status = 'Timeout';
                });
                break;
            case 2:
                message += 'NOP';
                break;
            case 3:
                message += 'Awake';
                zwaveHome.setNodeStatus(nodeId, 'Awake');
                bitdogClient.sendData('bd-zNodeStatus', coreMessageSchemas.zwaveNodeStatusMessageSchema, function (message) {
                    message.homeId = zwaveHome.homeId;
                    message.nodeId = nodeId;
                    message.status = 'Awake';
                });
                break;
            case 4:
                message += 'Asleep';
                zwaveHome.setNodeStatus(nodeId, 'Asleep');
                bitdogClient.sendData('bd-zNodeStatus', coreMessageSchemas.zwaveNodeStatusMessageSchema, function (message) {
                    message.homeId = zwaveHome.homeId;
                    message.nodeId = nodeId;
                    message.status = 'Asleep';
                });
                break;
            case 5:
                message += 'Dead';
                zwaveHome.setNodeStatus(nodeId, 'Dead');
                bitdogClient.sendData('bd-zNodeStatus', coreMessageSchemas.zwaveNodeStatusMessageSchema, function (message) {
                    message.homeId = zwaveHome.homeId;
                    message.nodeId = nodeId;
                    message.status = 'Dead';
                });
                break;
            case 6:
                message += 'Alive';
                zwaveHome.setNodeStatus(nodeId, 'Alive');
                bitdogClient.sendData('bd-zNodeStatus', coreMessageSchemas.zwaveNodeStatusMessageSchema, function (message) {
                    message.homeId = zwaveHome.homeId;
                    message.nodeId = nodeId;
                    message.status = 'Alive';
                });
                break;
            default:
                message += 'Unknown notification - ' + notif;
                break;

        }

        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, message);

    });


    zwave.on('controller command', function (nodeId, state, error, controllerMessage, help) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Controller commmand feedback: ', { nodeId: nodeId, message: controllerMessage, state: state, error: error, help: help });

        bitdogClient.sendData('bd-zControllerModeChanged', coreMessageSchemas.zwaveControllerModeMessageSchema, function (message) {
            message.homeId = zwaveHome.homeId;
            message.nodeId = nodeId;
            message.mode = controllerMessage;
        });
    });


    this.start = function () {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Connecting to controller...');
        var connections = bitdogClient.configuration.get(constants.ZWAVE_CONNECTIONS_CONFIG);
        zwave.connect(connections[0]);
    };

    this.stop = function () {
        if (zwave != null) {
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Disconnecting from controller...');
            var connections = bitdogClient.configuration.get(constants.ZWAVE_CONNECTIONS_CONFIG);
            zwave.disconnect(connections[0]);
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Disconnected from controller.');
        }
    };

    // This method will send the request to change a zwave value to the zwave device
    this.setValue = function (nodeId, classId, instanceId, indexId, value) {
        var zwaveValue = zwaveHome.getValue(nodeId, classId, instanceId, indexId);

        if (zwaveValue !== null) {
            // make sure the value is the correct type
            value = zwaveValue.convert(value);
            zwave.setValue(nodeId, classId, instanceId, indexId, value);
        } else {
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Value not found', { modeId: nodeId, classId: classId, instanceId: instanceId, index: indexId });

        }
    };

    this.requestAllConfigParams = function (nodeId) {
        zwave.requestAllConfigParams(nodeId);
    };

    this.addNode = function (withSecurity) {
        zwave.addNode(withSecurity);
    };

    this.removeNode = function () {
        zwave.removeNode();
    };

    this.cancelControllerCommand = function () {
        zwave.cancelControllerCommand();
    };

    this.hardResetController = function () {
        zwave.hardReset();
    };

    this.softResetController = function () {
        zwave.softReset();
    };


    this.setNodeName = function (homeId, nodeId, name) {
        var zwaveNode = zwaveHome.getNode(nodeId);

        if (typeof zwaveNode !== typeof undefined && zwaveNode !== null) {
            zwaveNode.name = name;
            zwave.setNodeName(nodeId, name);
            sendZwaveConfigurationMessages();

        }
    };

    this.getNodeDisplayName = function (nodeId) {
        var zwaveNode = zwaveHome.getNode(nodeId);

        if (typeof zwaveNode !== typeof undefined && zwaveNode !== null) {
            return zwaveNode.displayName;
        } else {
            return null;
        }
    }
    this.setNodeLocation = function (homeId, nodeId, location) {
        var zwaveNode = zwaveHome.getNode(nodeId);

        if (typeof zwaveNode !== typeof undefined && zwaveNode !== null) {
            zwaveNode.location = location;
            zwave.setNodeLocation(nodeId, location);
            sendZwaveConfigurationMessages();

        }
    };

    this.setNodeOn = function (nodeId) {
        zwave.setNodeOn(nodeId);
    };

    this.setNodeOff = function (nodeId) {
        zwave.setNodeOff(nodeId);
    };

    this.setNodeLevel = function (nodeId, value) {
        zwave.setNodeLevel(nodeId, value);
    };

    this.pressButton = function (nodeId, classId, instanceId, index) {
        zwave.pressButton({ node_id: nodeId, class_id: classId, instance: instanceId, index: index });
    };

    this.releaseButton = function (nodeId, classId, instanceId, index) {
        zwave.releaseButton({ node_id: nodeId, class_id: classId, instance: instanceId, index: index });
    };

    this.healNetworkNode = function (nodeId, doReturnRoutes) {
        zwave.healNetworkNode(nodeId, doReturnRoutes);
    };

    this.healNetwork = function () {
        zwave.healNetwork();
    };

    this.getNeighbors = function () {
        zwave.getNeighbors();
    };

    this.refreshNodeInfo = function (nodeId) {
        zwave.refreshNodeInfo(nodeid);
    };

    this.removeFailedNode = function (nodeId) {
        zwave.removeFailedNode(nodeId);
    };

    this.createScene = function (homeId, label) {
        return zwave.createScene(label, homeId);
    };

    this.getScenes = function () {
        return zwave.getScenes();
    };

    this.removeScene = function (sceneId) {
        return zwave.removeScene(sceneId);
    };

    this.addSceneValue = function (sceneId, nodeId, commandclass, instance, index, value) {
        zwave.addSceneValue(sceneId, nodeId, commandclass, instance, index, value);
    };

    this.removeSceneValue = function (sceneId, nodeId, commandclass, instance, index) {
        zwave.removeSceneValue(sceneId, nodeId, commandclass, instance, index);
    };

    this.getSceneValues = function (sceneId) {
        return zwave.sceneGetValues(sceneId);
    };

    this.activateScene = function (sceneId) {
        zwave.activateScene(sceneId);
    };

    function setReady(isReady) {
        _isReady = isReady;
        self.emit('ready', _isReady);
    }

    function saveZwaveConfigurations(transactionId, homeId, nodes, successCallback, errorCallback) {
        var self = this;
        var port = null;
        var protocol = null;

        var request = {
            nodeId: bitdogClient.configuration.nodeId,
            authKey: bitdogClient.configuration.authKey,
            transactionId: transactionId,
            homeId: homeId,
            configurations: nodes.map(function (node) { return { id: node.id, configuration: JSON.stringify(node) }; })
        };

        var requestJson = JSON.stringify(request);

        var headers = {
            'Content-Type': 'application/json',
        };

        var parsedUrl = url.parse(bitdogClient.constants.CENTRAL_URL + '/realm/saveZWaveConfigurations');

        if (parsedUrl.port != null)
            port = parsedUrl.port;
        else {
            if (parsedUrl.protocol == 'http:')
                port = 80;
            else (parsedUrl.protocol == 'https:')
            port = 443;
        }

        var options = {
            host: parsedUrl.hostname,
            port: port,
            path: parsedUrl.pathname,
            method: 'POST',
            headers: headers
        };

        protocol = parsedUrl.protocol == 'https:' ? https : http;

        var request = protocol.request(options, function (response) {
            response.setEncoding('utf-8');

            var responseString = '';

            response.on('data', function (data) {
                responseString += data;
            });

            response.on('end', function () {

                if (this.statusCode == 200 && responseString.length > 1) {
                    var resultObject = {};

                    try {
                        resultObject = JSON.parse(responseString);
                    }
                    catch (e) {
                        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Error parsing JSON from saveZWaveConfigurations:', e);
                    }

                    if (resultObject.Success === true) {
                        if (typeof successCallback !== typeof undefined) {
                            successCallback();
                        }

                        return;
                    }

                    if (resultObject.Success !== true) {
                        if (errorCallback)
                            errorCallback('Authorization failed');
                        return;
                    }

                    if (errorCallback)
                        errorCallback('Unexpected response /realm/saveZWaveConfigurations');

                }
                else {
                    if (errorCallback)
                        errorCallback('Unexpected response from /realm/saveZWaveConfigurations. Status code: ' + this.statusCode + ' Response: ' + responseString);
                }
            });
        });

        request.on('error', function (e) {
            if (errorCallback)
                errorCallback(e);
        });

        request.write(requestJson);
        request.end();

    }

    function sendZwaveConfigurationMessages() {
        var transactionId = Date.now();
  
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Sending updated zwave configurations');

        for (var index = 0; index < zwaveHome.nodes.length; index++) {
            var node = zwaveHome.nodes[index];
            var neighbors = zwave.getNodeNeighbors(node.id); // get all the current node neighbors
            node.neighbors.splice(0); // clear the current list of neighbors

            // add the newly discovered neighbors
            for (var neighborIndex = 0; neighborIndex < neighbors.length; neighborIndex++) {
                node.neighbors.push(neighbors[neighborIndex]);
            }

         }

        saveZwaveConfigurations(transactionId, zwaveHome.homeId, zwaveHome.nodes);

    }

  



}

util.inherits(BitdogZWave, EventEmitter);


module.exports = BitdogZWave;
