var ZWave = require('openzwave-shared');
var ZWaveNode = require('./zwave/zwaveNode.js');
var os = require('os');

var coreMessageSchemas = require('./coreMessageSchemas.js');
var zwaveCommandClasses = require('./zwaveCommandClasses.js');
var constants = require('./constants.js');
var zwave = null;
var zwavedriverpaths = {
    "darwin" : '/dev/cu.usbmodem1411',
    "linux"  : '/dev/ttyACM0',
    "windows": '\\\\.\\COM9'
};
var zwaveNodes = {};

function BitdogZWave(bitdogClient) {
    
    zwave = new ZWave({
        ConsoleOutput: false,
        Logging: true,
        SaveConfiguration: true,
        DriverMaxAttempts: 3,
        PollInterval: 1000,
        SuppressValueRefresh: true
    });
    
    zwave.on('node added', function (nodeId, value) {
        var zwaveNode = new ZWaveNode(nodeId);
        zwaveNode.homeId = zwave.homeId;
        zwaveNodes[nodeId] = zwaveNode;

        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE,'Node added', { nodeId: nodeId, zwaveNode: zwaveNode, value: value });
    });
    
    zwave.on('value added', function (nodeId, commandClassId, zwaveValue) {
        var zwaveNode = zwaveNodes[nodeId];
        
        if(typeof zwaveNode != typeof undefined)
            zwaveNodes[nodeId].updateValue(zwaveValue);
    });
    
    zwave.on('value changed', function (nodeId, commandClassId, zwaveValue) {
        var zwaveNode = zwaveNodes[nodeId];
        
        if (typeof zwaveNode !== typeof undefined) {
            if (zwaveNodes[nodeId].updateValue(zwaveValue) === true) {
                
                bitdogClient.sendData(zwaveValue.value_id, coreMessageSchemas.zwaveEventMessageSchema, function (message) {
                    message.value = zwaveValue.value;
                });
            }
        }
    });
    
    zwave.on('value removed', function (nodeId, commandClassId, instanceId, index) {
        var zwaveNode = zwaveNodes[nodeId];
        
        if (typeof zwaveNode != typeof undefined) {
            zwaveNode.removeValue(commandClassId, instanceId, index);
        }
    });
    
    zwave.on('driver ready', function (homeId) {
        zwave.homeId = homeId;
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE,'Scanning, home id is', homeId.toString(16));
    });
    
    zwave.on('driver failed', function () {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE,'Failed to start driver');
        zwave.disconnect();
        process.exit();
    });
    
    zwave.on('scan complete', function () {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE,'Scan complete');

    });

    zwave.on('node ready', function (nodeId, nodeInfo) {
        var zwaveNode = zwaveNodes[nodeId];
        
        if (typeof zwaveNode != typeof undefined) {
            zwaveNode.setNodeInformation(nodeInfo);
            
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Node ready', { zwaveNode: zwaveNode, nodeIfo: nodeInfo });
            
            for (var comclass in zwaveNode.commandClasses) {
                switch (comclass) {
                    case 'SWITCH_BINARY': // COMMAND_CLASS_SWITCH_BINARY
                        zwave.enablePoll(nodeId, 37);
                        break;
                    case 'SWITCH_MULTILEVEL':// COMMAND_CLASS_SWITCH_MULTILEVEL
                        zwave.enablePoll(nodeId, 38);
                        break;
                }
            }

            sendZwaveConfigurationMessage(nodeId);
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
                break;
            case 4:
                message += 'Asleep';
                break;
            case 5:
                message += 'Dead';
                break;
            case 6:
                message += 'Alive';
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
        zwave.connect(zwavedriverpaths[os.platform()]);
    };

    this.stop = function () {
        if (zwave != null) {
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Disconnecting from controller...');
            zwave.disconnect();
        }
    }

    function sendZwaveConfigurationMessage(nodeId) {
        
        // Create a configuration message
        var configurationMessage = coreMessageSchemas.zwaveConfigurationMessageSchema.createMessage(constants.MESSAGE_CLASS_ZWAVE_CONFIGURATION);
        configurationMessage.d.node = zwaveNodes[nodeId];
        
        bitdogClient.sendMessage(configurationMessage);
    };
}

module.exports = BitdogZWave; 
