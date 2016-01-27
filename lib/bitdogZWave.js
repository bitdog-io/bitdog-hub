var ZWave = require('openzwave-shared');
var bitdogClient = require('bitdog-client');
var os = require('os');

var commandMessageSchemas = require('./commonMessageSchemas.js');
var zwaveCommandClasses = require('./zwaveCommandClasses.js');
var constants = require('./constants.js');
var zwave = null;
var zwavedriverpaths = {
    "darwin" : '/dev/cu.usbmodem1411',
    "linux"  : '/dev/ttyACM0',
    "windows": '\\\\.\\COM9'
};
var zwaveNodes = [];

function BitdogZWave() {
    
    zwave = new ZWave({
        ConsoleOutput: false,
        Logging: false,
        SaveConfiguration: true,
        DriverMaxAttempts: 3,
        PollInterval: 500,
        SuppressValueRefresh: true
    });
    
    zwave.on('node added', function (zwaveNodeid) {
        zwaveNodes[zwaveNodeid] = {
            zwaveNodeId: zwaveNodeid,
            manufacturer: '',
            manufacturerid: '',
            product: '',
            producttype: '',
            productid: '',
            type: '',
            name: '',
            loc: '',
            classes: {},
            ready: false,
        };
        
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE,'Node added', zwaveNodes[zwaveNodeid]);
    });
    
    zwave.on('value added', function (zwaveNodeid, comclass, value) {
        if (!zwaveNodes[zwaveNodeid]['classes'][comclass])
            zwaveNodes[zwaveNodeid]['classes'][comclass] = {};
        
        zwaveNodes[zwaveNodeid]['classes'][comclass][value.index] = value;
        
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Value added', { zwaveNodeId: zwaveNodeid, commandClass: zwaveCommandClasses.getCommand(comclass), instance: value.index, value: value });
    });
    
    zwave.on('driver ready', function (homeid) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE,'Scanning homeid=0x%s...', homeid.toString(16));
    });
    
    zwave.on('driver failed', function () {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE,'Failed to start driver');
        zwave.disconnect();
        process.exit();
    });
    
    zwave.on('scan complete', function () {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE,'Scan complete');

    });

    zwave.on('node ready', function (zwaveNodeid, nodeinfo) {
        var zwaveNode = zwaveNodes[zwaveNodeid];
        zwaveNode.manufacturer = nodeinfo.manufacturer;
        zwaveNode.manufacturerid = nodeinfo.manufacturerid;
        zwaveNode.product = nodeinfo.product;
        zwaveNode.producttype = nodeinfo.producttype;
        zwaveNode.productid = nodeinfo.productid;
        zwaveNode.type = nodeinfo.type;
        zwaveNode.name = nodeinfo.name;
        zwaveNode.loc = nodeinfo.loc;
        zwaveNode.ready = true;
        
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE,'Node ready', zwaveNode);
        
        for (var comclass in zwaveNode.classes) {
            switch (comclass) {
                case 0x25: // COMMAND_CLASS_SWITCH_BINARY
                case 0x26:// COMMAND_CLASS_SWITCH_MULTILEVEL
                    zwave.enablePoll(zwaveNodeid, comclass);
                    break;
            }
        }
    });
    
    zwave.on('notification', function (zwaveNodeid, notif) {
        var message = 'Node' + zwaveNodeid + ': ';
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
    
    zwave.on('value changed', function (zwaveNodeid, comclass, value) {
        var zwaveNode = zwaveNodes[zwaveNodeid];

        if (zwaveNode.ready) {
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Value changed', { zwaveNodeId: zwaveNodeid, commandClass: comclass, instance: value.instance, index: value.index, oldValue: zwaveNode.classes[comclass][value.index].value, newValue: value.value });
        }

        zwaveNode.classes[comclass][value.index] = value;
        
        bitdogClient.sendData(value.value_id, commandMessageSchemas.zwaveEventMessageSchema, function (message) { 
            message.value = value.value;
        });
    });
    
    zwave.on('value removed', function (zwaveNodeid, comclass, index) {
        var zwaveNode = zwaveNodes[zwaveNodeid];

        if (zwaveNode.classes[comclass] &&
            zwaveNode.classes[comclass][index])
            delete zwaveNode.classes[comclass][index];
    });
    
    zwave.on('controller command', function (zwaveNodeId, returnValue, state, message) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Controller commmand feedback: ', { zwaveNodeId: zwaveNodeId, message: message, state: state, returnValue: returnValue});
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
}

module.exports = BitdogZWave; 
