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

bitdogClient.addDataCollector('bd-zValueChanged', coreMessageSchemas.zwaveValueMessageSchema , -1, function (message, configuration, logger) { 
}, true);

bitdogClient.addDataCollector('bd-zNodeStatus', coreMessageSchemas.zwaveNodeStatusMessageSchema , -1, function (message, configuration, logger) { 
}, true);

bitdogClient.addCommand('bd-zSetValue', coreMessageSchemas.zwaveValueMessageSchema, function (message, configuration, logger) {
    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE,'Set value command received', message );
    bitdogZWave.setValue(message.nodeId, message.classId, message.instanceId, message.indexId, message.value);
}, undefined, undefined, true);

bitdogClient.addCommand('bd-zTurnOn', coreMessageSchemas.zwaveSetNodeMessageSchema, function (message, configuration, logger) {
    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Set node on command received', { homeId:message.homeId, nodeId: message.nodeId });
    bitdogZWave.setNodeOn(message.nodeId);
}, undefined,undefined, true);

bitdogClient.addCommand('bd-zTurnOff', coreMessageSchemas.zwaveSetNodeMessageSchema, function (message, configuration, logger) {
    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Set node off command received', { homeId: message.homeId, nodeId: message.nodeId });
    bitdogZWave.setNodeOff(message.nodeId);
}, undefined,undefined, true);

bitdogClient.addCommand('bd-zSetLevel', coreMessageSchemas.zwaveSetNodeLevelMessageSchema, function (message, configuration, logger) {
    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Set node level command received', { homeId: message.homeId, nodeId: message.nodeId, value: message.value });
    bitdogZWave.setNodeLevel(message.nodeId, message.value);
}, undefined,undefined, true);

bitdogClient.start();