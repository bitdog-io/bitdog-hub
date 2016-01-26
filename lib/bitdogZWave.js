var ZWave = require('openzwave-shared');
var bitdogClient = require('bitdog-client');
var os = require('os');
var commandMessageSchemas = require('./commonMessageSchemas.js');
var zwaveCommandClasses = require('./zwaveCommandClasses.js');
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
        
        bitdogClient.logger.logProcessEvent('ZWave node added', zwaveNodes[zwaveNodeid]);
    });
    
    zwave.on('value added', function (zwaveNodeid, comclass, value) {
        if (!zwaveNodes[zwaveNodeid]['classes'][comclass])
            zwaveNodes[zwaveNodeid]['classes'][comclass] = {};
        
        zwaveNodes[zwaveNodeid]['classes'][comclass][value.index] = value;
        
        bitdogClient.logger.logProcessEvent('ZWave value added', { zwaveNodeId: zwaveNodeid, commandClass: zwaveCommandClasses.getCommand(comclass), instance: value.index, value: value });
    });
    
    zwave.on('driver ready', function (homeid) {
        bitdogClient.logger.logProcessEvent('Zwave scanning homeid=0x%s...', homeid.toString(16));
    });
    
    zwave.on('driver failed', function () {
        bitdogClient.logger.logProcessEvent('ZWave failed to start driver');
        zwave.disconnect();
        process.exit();
    });
    
    zwave.on('scan complete', function () {
        bitdogClient.logger.logProcessEvent('ZWave scan complete');

    });

    zwave.on('node ready', function (zwaveNodeid, nodeinfo) {
        zwaveNodes[zwaveNodeid]['manufacturer'] = nodeinfo.manufacturer;
        zwaveNodes[zwaveNodeid]['manufacturerid'] = nodeinfo.manufacturerid;
        zwaveNodes[zwaveNodeid]['product'] = nodeinfo.product;
        zwaveNodes[zwaveNodeid]['producttype'] = nodeinfo.producttype;
        zwaveNodes[zwaveNodeid]['productid'] = nodeinfo.productid;
        zwaveNodes[zwaveNodeid]['type'] = nodeinfo.type;
        zwaveNodes[zwaveNodeid]['name'] = nodeinfo.name;
        zwaveNodes[zwaveNodeid]['loc'] = nodeinfo.loc;
        zwaveNodes[zwaveNodeid]['ready'] = true;
        
        bitdogClient.logger.logProcessEvent('ZWave node ready', zwaveNodes[zwaveNodeid]);
        
        for (var comclass in zwaveNodes[zwaveNodeid]['classes']) {
            switch (comclass) {
                case 0x25: // COMMAND_CLASS_SWITCH_BINARY
                case 0x26:// COMMAND_CLASS_SWITCH_MULTILEVEL
                    zwave.enablePoll(zwaveNodeid, comclass);
                    break;
            }
        }
    });
    
    zwave.on('notification', function (zwaveNodeid, notif) {
        var message = 'ZWave node' + zwaveNodeid + ': ';
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

        bitdogClient.logger.logProcessEvent(message);

    });
    
    zwave.on('value changed', function (zwaveNodeid, comclass, value) {
        if (zwaveNodes[zwaveNodeid]['ready']) {
            bitdogClient.logger.logProcessEvent('ZWave value changed', { zwaveNodeId: zwaveNodeid, commandClass: comclass, instance: value.instance, index: value.index, oldValue: zwaveNodes[zwaveNodeid]['classes'][comclass][value.index]['value'], newValue: value['value'] });
        }

        zwaveNodes[zwaveNodeid]['classes'][comclass][value.index] = value;
        
        bitdogClient.sendData(value.value_id, commandMessageSchemas.zwaveEventMessageSchema, function (message) { 
            message.value = value['value'];
        });
    });
    
    zwave.on('value removed', function (zwaveNodeid, comclass, index) {
        if (zwaveNodes[zwaveNodeid]['classes'][comclass] &&
            zwaveNodes[zwaveNodeid]['classes'][comclass][index])
            delete zwaveNodes[zwaveNodeid]['classes'][comclass][index];
    });
    
    zwave.on('controller command', function (zwaveNodeId, returnValue, state, message) {
        bitdogClient.logger.logProcessEvent('ZWave controller commmand feedback: ', { zwaveNodeId: zwaveNodeId, message: message, state: state, returnValue: returnValue});
    });


    this.start = function () {
        bitdogClient.logger.logProcessEvent('ZWave connecting to controller...');
        zwave.connect(zwavedriverpaths[os.platform()]);
    };

    this.stop = function () {
        if (zwave != null) {
            bitdogClient.logger.logProcessEvent('ZWave disconnecting from controller...');
            zwave.disconnect();
        }
    }
}

module.exports = BitdogZWave; 
