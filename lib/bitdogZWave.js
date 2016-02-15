var ZWave = require('openzwave-shared');
var ZWaveHome = require('./zwave/zwaveHome.js');

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
var zwaveHome = new ZWaveHome();
var tid = 0;


function BitdogZWave(bitdogClient) {
    
    zwave = new ZWave({
        ConsoleOutput: false,
        Logging: true,
        SaveConfiguration: true,
        DriverMaxAttempts: 3,
        PollInterval: 1000,
        SuppressValueRefresh: true
    });
    
    zwave.on('node added', function (nodeId) {
        zwaveHome.createNode(nodeId);
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Added node id: ', nodeId);

    });
    
    zwave.on('value added', function (nodeId, commandClassId, zwaveValueInfo) {
        zwaveHome.updateValue(zwaveValueInfo);
    });
    
    zwave.on('value changed', function (nodeId, commandClassId, zwaveValueInfo) {
        if (zwaveHome.updateValue(zwaveValueInfo) === true) {
            bitdogClient.sendData(zwaveValueInfo.value_id, coreMessageSchemas.zwaveEventMessageSchema, function (message) {
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
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Node available', { zwaveNode: zwaveNode });
       
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
    };
    
    this.setValue = function (nodeId, classId, instanceId, indexId, value) {
        zwave.setValue(nodeId, classId, instanceId, indexId, value);
    };
    
    this.setNodeOn = function (nodeId) {
        zwave.setNodeOn(nodeId);
    }
    
    this.setNodeOff = function (nodeId) {
        zwave.setNodeOff(nodeId);
    }
    
    this.setNodeLevel = function (nodeId, value) {
        zwave.setNodeLevel(nodeId,value);
    }

    function sendZwaveConfigurationMessages() {
        tid++;

        for (var index = 0; index < zwaveHome.nodes.length; index++) {
            var zwaveNode = zwaveHome.nodes[index];
            var configurationMessage = coreMessageSchemas.zwaveConfigurationMessageSchema.createMessage(constants.MESSAGE_CLASS_ZWAVE_CONFIGURATION);
            configurationMessage.d.tid = tid;
            configurationMessage.d.node =zwaveNode;
            bitdogClient.sendMessage(configurationMessage);
        }
    };
}

module.exports = BitdogZWave; 
