var ZWave = require('openzwave-shared');
var ZWaveHome = require('./zwaveHome.js');

var os = require('os');

var coreMessageSchemas = require('../coreMessageSchemas.js');
var constants = require('../constants.js');
var zwave = null;
var zwaveHome = new ZWaveHome();
var brain = require('../brains/brain.js');


function BitdogZWave(bitdogClient) {

    var scanComplete = false;
    var zwaveConfiguration = {
        ConsoleOutput: false,
        Logging: true,
        SaveConfiguration: true,
        DriverMaxAttempts: 3,
        PollInterval: 3000
    };

    var networkKey = bitdogClient.configuration.get(constants.ZWAVE_NETWORKKEY_CONFIG);

    if (typeof networkKey !== typeof undefined && networkKey != null)
        zwaveConfiguration.NetworkKey = networkKey;

    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Setting configuration', zwaveConfiguration);

    zwave = new ZWave(zwaveConfiguration);

    zwave.on('node added', function (nodeId) {
        var zwaveNode = zwaveHome.createNode(nodeId);
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Node added', { zwaveNode: zwaveNode });

    });

    zwave.on('value added', function (nodeId, commandClassId, zwaveValueInfo) {
        if (zwaveHome.updateValue(nodeId, zwaveValueInfo) === true) {
            bitdogClient.sendData('bd-zValueChanged', coreMessageSchemas.zwaveValueMessageSchema, function (message) {
                message.homeId = zwaveHome.homeId;
                message.valueId = zwaveValueInfo.value_id;
                message.value = zwaveValueInfo.value;
            });

        }
    });

    zwave.on('value changed', function (nodeId, commandClassId, zwaveValueInfo) {
        if (zwaveHome.updateValue(nodeId, zwaveValueInfo) === true) {
            bitdogClient.sendData('bd-zValueChanged', coreMessageSchemas.zwaveValueMessageSchema, function (message) {
                message.homeId = zwaveHome.homeId;
                message.valueId = zwaveValueInfo.value_id;
                message.value = zwaveValueInfo.value;
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
        process.exit();
    });

    zwave.on('scan complete', function () {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Scan complete');
        sendZwaveConfigurationMessages();
        scanComplete = true;
    });

    zwave.on('node available', function (nodeId, zwaveNodeInfo) {
        var zwaveNode = zwaveHome.setNodeInformation(nodeId, zwaveNodeInfo, false);
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Node available', { nodeId: nodeId, zwaveNode: zwaveNode });
    });

    zwave.on('node ready', function (nodeId, zwaveNodeInfo) {
        var zwaveNode = zwaveHome.setNodeInformation(nodeId, zwaveNodeInfo, true);
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Node ready', { zwaveNode: zwaveNode });

        brain.getZWaveNode(zwaveHome.homeId, zwaveNode.id).then(function (record) {

            if (record != null) {
                bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Found node record', record);

                zwaveNode.name = record.node.name;
                zwaveNode.location = record.node.location;
            }
            if (scanComplete)
                sendZwaveConfigurationMessages();

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


    zwave.on('controller command', function (nodeId, state, error, message) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Controller commmand feedback: ', { nodeId: nodeId, message: message, state: state, error: error });
    });


    this.start = function () {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Connecting to controller...');
        var connections = bitdogClient.configuration.get(constants.ZWAVE_CONNECTIONS_CONFIG);
        zwave.connect(connections[0]);
    };

    this.stop = function () {
        if (zwave != null) {
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Disconnecting from controller...');
            zwave.disconnect();
        }
    };

    this.setValue = function (nodeId, classId, instanceId, indexId, value) {
        var zwaveValue = zwaveHome.getValue(nodeId, classId, instanceId, indexId);

        if (zwaveValue !== null) {
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


    function sendZwaveConfigurationMessages() {
        var configurationMessage = coreMessageSchemas.zwaveConfigurationMessageSchema.createMessage(constants.MESSAGE_CLASS_ZWAVE_CONFIGURATION);
        configurationMessage.d.c = zwaveHome;
        bitdogClient.sendMessage(configurationMessage);

    }
}

module.exports = BitdogZWave;
