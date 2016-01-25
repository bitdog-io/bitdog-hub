var ZWave = require('openzwave-shared');
var os = require('os');
var bitdog = require('bitdog-client');
var commandMessageSchemas = require('./commonMessageSchemas.js');
var zwaveCommandClasses = require('./zwaveCommandClasses.js');
var zwave = null;
var zwavedriverpaths = {
    "darwin" : '/dev/cu.usbmodem1411',
    "linux"  : '/dev/ttyACM0',
    "windows": '\\\\.\\COM9'
};
var zwaveNodes = [];

bitdog.on('ready', function (logger, configuration) {
    initializeZWave();  
});

// Start that connection and watch the messages
bitdog.start();

function initializeZWave() {
    zwave = new ZWave({
        ConsoleOutput: false
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
        
        bitdog.logger.logProcessEvent('ZWave Node added', zwaveNodes[zwaveNodeid]);
    });
    
    zwave.on('value added', function (zwaveNodeid, comclass, value) {
        if (!zwaveNodes[zwaveNodeid]['classes'][comclass])
            zwaveNodes[zwaveNodeid]['classes'][comclass] = {};
        
        zwaveNodes[zwaveNodeid]['classes'][comclass][value.index] = value;
        
        bitdog.logger.logProcessEvent('ZWave value added', { zwaveNodeId: zwaveNodeid, commandClass: zwaveCommandClasses.getCommand(comclass), instance: value.index, value: value });
    });
    
    zwave.on('driver ready', function (homeid) {
        bitdog.logger.logProcessEvent('Zwave scanning homeid=0x%s...', homeid.toString(16));
    });
    
    zwave.on('driver failed', function () {
        bitdog.logger.logProcessEvent('failed to start driver');
        zwave.disconnect();
        process.exit();
    });
    
    zwave.on('scan complete', function () {
        bitdog.logger.logProcessEvent('ZWave scan complete');

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
        
        bitdog.logger.logProcessEvent('ZWave node ready', zwaveNodes[zwaveNodeid]);
        
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
        switch (notif) {
            case 0:
                console.log('node%d: message complete', zwaveNodeid);
                break;
            case 1:
                console.log('node%d: timeout', zwaveNodeid);
                break;
            case 2:
                console.log('node%d: nop', zwaveNodeid);
                break;
            case 3:
                console.log('node%d: node awake', zwaveNodeid);
                break;
            case 4:
                console.log('node%d: node sleep', zwaveNodeid);
                break;
            case 5:
                console.log('node%d: node dead', zwaveNodeid);
                break;
            case 6:
                console.log('node%d: node alive', zwaveNodeid);
                break;
            default:
                console.log('node%d: unknown notification', zwaveNodeid);
                break;
    
        }
    });
    
    zwave.on('value changed', function (zwaveNodeid, comclass, value) {
        if (zwaveNodes[zwaveNodeid]['ready']) {
            bitdog.logger.logProcessEvent('ZWave value changed', { zwaveNodeId: zwaveNodeid, commandClass: comclass, instance: value.instance, index: value.index, oldValue: zwaveNodes[zwaveNodeid]['classes'][comclass][value.index]['value'], newValue: value['value'] });
        }

        zwaveNodes[zwaveNodeid]['classes'][comclass][value.index] = value;
        
        bitdog.sendData(value.value_id, commandMessageSchemas.zwaveEventMessageSchema, function (message) { 
            message.value = value['value'];
        });
    });
    
    bitdog.logger.logProcessEvent('ZWave connecting to controller...');
    zwave.connect(zwavedriverpaths[os.platform()]);

}




//zwave.on('value removed', function (nodeid, comclass, index) {
//    if (nodes[nodeid]['classes'][comclass] &&
//        nodes[nodeid]['classes'][comclass][index])
//        delete nodes[nodeid]['classes'][comclass][index];
//});

//zwave.on('node ready', function (nodeid, nodeinfo) {
//    nodes[nodeid]['manufacturer'] = nodeinfo.manufacturer;
//    nodes[nodeid]['manufacturerid'] = nodeinfo.manufacturerid;
//    nodes[nodeid]['product'] = nodeinfo.product;
//    nodes[nodeid]['producttype'] = nodeinfo.producttype;
//    nodes[nodeid]['productid'] = nodeinfo.productid;
//    nodes[nodeid]['type'] = nodeinfo.type;
//    nodes[nodeid]['name'] = nodeinfo.name;
//    nodes[nodeid]['loc'] = nodeinfo.loc;
//    nodes[nodeid]['ready'] = true;
//    console.log('node%d: %s, %s', nodeid,
//            nodeinfo.manufacturer ? nodeinfo.manufacturer
//                      : 'id=' + nodeinfo.manufacturerid,
//            nodeinfo.product ? nodeinfo.product
//                     : 'product=' + nodeinfo.productid +
//                       ', type=' + nodeinfo.producttype);
//    console.log('node%d: name="%s", type="%s", location="%s"', nodeid,
//            nodeinfo.name,
//            nodeinfo.type,
//            nodeinfo.loc);
//    for (comclass in nodes[nodeid]['classes']) {
//        switch (comclass) {
//            case 0x25: // COMMAND_CLASS_SWITCH_BINARY
//            case 0x26:// COMMAND_CLASS_SWITCH_MULTILEVEL
//                zwave.enablePoll(nodeid, comclass);
//                break;
//        }
//        var values = nodes[nodeid]['classes'][comclass];
//        console.log('node%d: class %d', nodeid, comclass);
//        for (idx in values)
//            console.log('node%d:   %s(%s)=%s', nodeid, values[idx]['label'], values[idx].index, values[idx]['value']);
//    }
//});

//zwave.on('notification', function (nodeid, notif) {
//    switch (notif) {
//        case 0:
//            console.log('node%d: message complete', nodeid);
//            break;
//        case 1:
//            console.log('node%d: timeout', nodeid);
//            break;
//        case 2:
//            console.log('node%d: nop', nodeid);
//            break;
//        case 3:
//            console.log('node%d: node awake', nodeid);
//            break;
//        case 4:
//            console.log('node%d: node sleep', nodeid);
//            break;
//        case 5:
//            console.log('node%d: node dead', nodeid);
//            break;
//        case 6:
//            console.log('node%d: node alive', nodeid);
//            break;
//        default:
//            console.log('node%d: unknown notification', nodeid);
//            break;

//    }
//});

//zwave.on('scan complete', function () {
//    console.log('====> scan complete, hit ^C to finish.');
//    setTimeout(function () { zwave.setValue(2, 112, 1, 101, 15); }, 1000);
//    setTimeout(function () { zwave.setValue(2, 112, 1, 102, 0); }, 3000);
//    setTimeout(function () { zwave.setValue(2, 112, 1, 103, 0); }, 3000);
//    setTimeout(function () { zwave.setValue(2, 112, 1, 111, 300); }, 3000);
//    setTimeout(function () { zwave.setValue(2, 112, 1, 90, true); }, 3000);
//    ;    	//setTimeout(function() {zwave.setValue(2,37,1,0,true);},1000);
//    //setTimeout(function() {zwave.setValue(2,112,1,85,360);},1000);
//    //setTimeout(function() {zwave.setValue(3,112,1,5,2);},1000);
//    setTimeout(function () { zwave.setValue(3, 112, 1, 101, 241); }, 1000);
//    setTimeout(function () { zwave.setValue(3, 112, 1, 102, 0); }, 1000);
//    setTimeout(function () { zwave.setValue(3, 112, 1, 103, 0); }, 1000);
//    setTimeout(function () { zwave.setValue(3, 112, 1, 111, 300); }, 1000);

//		//zwave.setValue({nodeid:5,	class_id: 38,	instance:1,	index:0}, 50 );
//});

//zwave.on('controller command', function (n, rv, st, msg) {
//    console.log('controller commmand feedback: %s node==%d, retval=%d, state=%d', msg, n, rv, st);
//});


//console.log("connecting to " + zwavedriverpaths[os.platform()]);
//zwave.connect(zwavedriverpaths[os.platform()]);

process.on('SIGINT', function () {
    bitdog.logger.logProcessEvent('disconnecting...');
    
    if(zwave != null)
        zwave.disconnect();
    
    process.exit();
});

module.exports = null; //bitdog();
