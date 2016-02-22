var bitdogClient = require('bitdog-client');
var constants = require('./constants.js');
var BitdogZWave = require('./bitdogZWave.js');
var coreMessageSchemas = require('./coreMessageSchemas.js');

var bitdogZWave = null;

bitdogClient.applicationName = 'bitdog-sa';


bitdogClient.on('ready', function () {

    bitdogZWave = new BitdogZWave(bitdogClient);
    bitdogZWave.start();

});

process.on('SIGINT', function () {
    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_BITDOG_SA, 'SIGINT, stopping.');

    if (bitdogZWave != null) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Stopping.');
        bitdogZWave.stop();
    }
    
    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_BITDOG_CLIENT, 'Stopping.');
    bitdogClient.stop();

    process.exit();
});

bitdogClient.addCommand('bd-setValue', coreMessageSchemas.zwaveSetValueMessageSchema, function (message, configuration, logger) {
    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE,'Set value command received', { homeId: message.homeId, nodeId: message.nodeId, classId: message.classId, instanceId: message.instanceId, indexId: message.indexId, value: message.value  } );
    bitdogZWave.setValue(message.nodeId, message.classId, message.instanceId, message.indexId, message.value);
}, undefined, undefined, true);

bitdogClient.addCommand('bd-turnOn', coreMessageSchemas.zwaveSetNodeMessageSchema, function (message, configuration, logger) {
    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Set node on command received', { homeId:message.homeId, nodeId: message.nodeId });
    bitdogZWave.setNodeOn(message.nodeId);
}, undefined,undefined, true);

bitdogClient.addCommand('bd-turnOff', coreMessageSchemas.zwaveSetNodeMessageSchema, function (message, configuration, logger) {
    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Set node off command received', { homeId: message.homeId, nodeId: message.nodeId });
    bitdogZWave.setNodeOff(message.nodeId);
}, undefined,undefined, true);

bitdogClient.addCommand('bs-setLevel', coreMessageSchemas.zwaveSetNodeLevelMessageSchema, function (message, configuration, logger) {
    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Set node level command received', { homeId: message.homeId, nodeId: message.nodeId, value: message.value });
    bitdogZWave.setNodeLevel(message.nodeId, message.value);
}, undefined,undefined, true);

bitdogClient.start();