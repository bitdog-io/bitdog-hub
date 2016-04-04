var ZWave = require('openzwave-shared');
var ZWaveHome = require('./zwaveHome.js');

var os = require('os');

var coreMessageSchemas = require('../coreMessageSchemas.js');
var constants = require('../constants.js');
var zwave = null;
var zwaveHome = new ZWaveHome();

function BitdogZWave(bitdogClient) {
    
    var zwaveConfiguration = {
        ConsoleOutput: false,
        Logging: true,
        SaveConfiguration: true,
        DriverMaxAttempts: 3,
        PollInterval: 1000,
        SuppressValueRefresh: true,
    };
    
    var networkKey = bitdogClient.configuration.Get(constants.ZWAVE_NETWORKKEY_CONFIG);
    
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
        var zwaveNode = zwaveNodes[nodeId];
        
        if (typeof zwaveNode != typeof undefined) {
            zwaveNode.removeValue(commandClassId, instanceId, index);
        }
    });
    
    zwave.on('driver ready', function (homeId) {
        zwaveHome.homeId = homeId;
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE,'Scanning, home id is', homeId.toString(16));
    });
    
    zwave.on('driver failed', function () {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE,'Failed to start driver');
        zwave.disconnect();
        process.exit();
    });
    
    zwave.on('scan complete', function () {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Scan complete');
        sendZwaveConfigurationMessages();
    });

    zwave.on('node available', function (nodeId, zwaveNodeInfo) {
        var zwaveNode = zwaveHome.setNodeInformation(nodeId, zwaveNodeInfo);
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Node available', { nodeId: nodeId, zwaveNode: zwaveNode });
       
    });

    zwave.on('node ready', function (nodeId, zwaveNodeInfo) {
        var zwaveNode = zwaveHome.setNodeInformation(nodeId, zwaveNodeInfo);
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Node ready', { zwaveNode: zwaveNode });
        
        for (var index = 0; index < zwaveNode.classes; index++) {
            var zwaveClass = zwaveNode.classes[index];

            switch (zwaveClass.id) {
                case 37:// SWITCH_BINARY
                    zwave.enablePoll(nodeId, 37);
                    break;
                case '38':// SWITCH_MULTILEVEL
                    zwave.enablePoll(nodeId, 38);
                    break;
            }
        }
       
    });
    
    zwave.on('notification', function (nodeId, notif) {
        var message = 'Node' + nodeId + ': ';
        switch (notif) {
            case 0:
                message += 'Message complete';
                break;
            case 1:
                message += 'Timeout';
                break;
            case 2:
                message += 'nop';
                break;
            case 3:
                message += 'Awake';
                bitdogClient.sendData('bd-zNodeStatus', coreMessageSchemas.zwaveNodeStatusMessageSchema, function (message) {
                    message.homeId = zwaveHome.homeId;
                    message.nodeId = nodeId;
                    message.status = 'Awake';
                });
                break;
            case 4:
                message += 'Asleep';
                bitdogClient.sendData('bd-zNodeStatus', coreMessageSchemas.zwaveNodeStatusMessageSchema, function (message) {
                    message.homeId = zwaveHome.homeId;
                    message.nodeId = nodeId;
                    message.status = 'Asleep';
                });
                break;
            case 5:
                message += 'Dead';
                bitdogClient.sendData('bd-zNodeStatus', coreMessageSchemas.zwaveNodeStatusMessageSchema, function (message) {
                    message.homeId = zwaveHome.homeId;
                    message.nodeId = nodeId;
                    message.status = 'Dead';
                });
                break;
            case 6:
                message += 'Alive';
                bitdogClient.sendData('bd-zNodeStatus', coreMessageSchemas.zwaveNodeStatusMessageSchema, function (message) {
                    message.homeId = zwaveHome.homeId;
                    message.nodeId = nodeId;
                    message.status = 'Alive';
                });
                break;
            default:
                message += 'Unknown notification';
                break;
    
        }

        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, message);

    });
    
    
    zwave.on('controller command', function (nodeId, returnValue, state, message) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Controller commmand feedback: ', { nodeId: nodeId, message: message, state: state, returnValue: returnValue});
    });


    this.start = function () {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Connecting to controller...');
        var connections = bitdogClient.configuration.Get(constants.ZWAVE_CONNECTIONS_CONFIG);
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
        value = zwaveValue.convert(value);
        zwave.setValue(nodeId, classId, instanceId, indexId, value);
    };
    
    this.addNode = function (withSecurity) {
        zwave.addNode(withSecurity);
    };
    
    this.removeNode = function () {
        zwave.removeNode();
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
    
    this.pressButton = function (valueId) {
        zwave.pressButton(valueId);
    }
    
    this.releaseButton = function (valueId) {
        zwave.releaseButton(valueId);
    }

    function sendZwaveConfigurationMessages() {
        var configurationMessage = coreMessageSchemas.zwaveConfigurationMessageSchema.createMessage(constants.MESSAGE_CLASS_ZWAVE_CONFIGURATION);
        configurationMessage.d.c = zwaveHome;
        bitdogClient.sendMessage(configurationMessage);
        
    }
}

module.exports = BitdogZWave; 
