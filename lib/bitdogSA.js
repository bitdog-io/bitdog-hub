var bitdogClient = require('bitdog-client');
var BitdogZWave = require('./zwave/bitdogZWave.js');
var EventEmitter = require('events').EventEmitter;

var constants = require('./constants.js');
var coreMessageSchemas = require('./coreMessageSchemas.js');
var bitdogAutomation = require('./automation/bitdogAutomation.js');
var bitdogAlarm = require('./alarm/bitdogAlarm.js');
var bitdogZWave = null;
var automationUrl = bitdogClient.constants.CENTRAL_URL + constants.AUTOMATION_PATH;
var zoneUrl = bitdogClient.constants.CENTRAL_URL + constants.AUTOMATION_PATH;

function bitdogSA() {
    bitdogClient.applicationName = 'bitdog-sa';
    
    bitdogClient.on('ready', function () {
        bitdogZWave = new BitdogZWave(bitdogClient);
        bitdogZWave.start();
    });
    
    bitdogClient.on('message', function (message) {
        bitdogAlarm.processMessage(message);
        bitdogAutomation.processMessage(message);
    });
    
    bitdogClient.addDataCollector('bd-zValueChanged', coreMessageSchemas.zwaveValueMessageSchema , -1, function (message, configuration, logger) { 
    }, true);
    
    bitdogClient.addDataCollector('bd-zNodeStatus', coreMessageSchemas.zwaveNodeStatusMessageSchema , -1, function (message, configuration, logger) { 
    }, true);
    
    bitdogClient.addCommand('bd-zAddNode', coreMessageSchemas.zwaveAddNodeMessageSchema, function (message, configuration, logger) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Add node command received', message);
        bitdogZWave.addNode(message.withSecurity);
    }, undefined, undefined, true);
    
    bitdogClient.addCommand('bd-zRemoveNode', coreMessageSchemas.zwaveRemoveNodeMessageSchema, function (message, configuration, logger) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Remove node command received', message);
        bitdogZWave.removeNode();
    }, undefined, undefined, true);
    
    bitdogClient.addCommand('bd-zSetValue', coreMessageSchemas.zwaveValueMessageSchema, function (message, configuration, logger) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Set value command received', message);
        var parsedValueId = parseValueId(message.valueId);
        bitdogZWave.setValue(parsedValueId.nodeId, parsedValueId.classId, parsedValueId.instanceId, parsedValueId.indexId, message.value);
    }, undefined, undefined, true);
    
    bitdogClient.addCommand('bd-zTurnOn', coreMessageSchemas.zwaveSetNodeMessageSchema, function (message, configuration, logger) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Set node on command received', { homeId: message.homeId, nodeId: message.nodeId });
        bitdogZWave.setNodeOn(message.nodeId);
    }, undefined, undefined, true);
    
    bitdogClient.addCommand('bd-zTurnOff', coreMessageSchemas.zwaveSetNodeMessageSchema, function (message, configuration, logger) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Set node off command received', { homeId: message.homeId, nodeId: message.nodeId });
        bitdogZWave.setNodeOff(message.nodeId);
    }, undefined, undefined, true);
    
    bitdogClient.addCommand('bd-zSetLevel', coreMessageSchemas.zwaveSetNodeLevelMessageSchema, function (message, configuration, logger) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Set node level command received', { homeId: message.homeId, nodeId: message.nodeId, value: message.value });
        bitdogZWave.setNodeLevel(message.nodeId, message.value);
    }, undefined, undefined, true);
    
    bitdogClient.addCommand('bd-zSetLevel', coreMessageSchemas.zwaveSetNodeLevelMessageSchema, function (message, configuration, logger) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Set node level command received', { homeId: message.homeId, nodeId: message.nodeId, value: message.value });
        bitdogZWave.setNodeLevel(message.nodeId, message.value);
    }, undefined, undefined, true);
    
    bitdogClient.addCommand('bd-zPressButton', coreMessageSchemas.zwaveActivateMessageSchema, function (message, configuration, logger) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Press button command received', { homeId: message.homeId, valueId: message.valueId });
        bitdogZWave.pressButton(message.nodeId, message.valueId);
    }, undefined, undefined, true);
    
    bitdogClient.addCommand('bd-zReleaseButton', coreMessageSchemas.zwaveActivateMessageSchema, function (message, configuration, logger) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Release button command received', { homeId: message.homeId, valueId: message.valueId });
        bitdogZWave.releaseButton(message.nodeId, message.value);
    }, undefined, undefined, true);
    
    bitdogClient.addCommand('bd-aArmAway', coreMessageSchemas.alarmArmAwayMessageSchema, function (message, configuration, logger) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ALARM, 'Arm away received', message);
        bitdogAlarm.armAway(message);
    }, undefined, undefined, true);
    
    bitdogClient.addCommand('bd-aArmStay', coreMessageSchemas.alarmArmStayMessageSchema, function (message, configuration, logger) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ALARM, 'Arm stay received', message);
        bitdogAlarm.armStay(message);
    }, undefined, undefined, true);
    
    bitdogClient.addCommand('bd-aDisarm', coreMessageSchemas.alarmDisarmMessageSchema, function (message, configuration, logger) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ALARM, 'Arm disarm received', message);
        bitdogAlarm.disarm(message);
    }, undefined, undefined, true);
    
    function parseValueId(valueId) {
        var values = valueId.split('-');
        var result = {
            nodeId: parseInt(values[0]),
            classId: parseInt(values[1]),
            instanceId: parseInt(values[2]),
            indexId: parseInt(values[3])
        };
        
        return result;
    }
   
}

util.inherits(bitdogSA, EventEmitter);

bitdogSA.prototype.start = function () {
    bitdogClient.start();
};

bitdogSA.prototype.stop = function () {

    if (bitdogZWave != null) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Stopping.');
        bitdogZWave.stop();
    }
    
    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_BITDOG_CLIENT, 'Stopping.');
    bitdogClient.stop();
};



// Singleton export
var _bitdogSA = new bitdogSA();
module.exports.bitdogSA = _bitdogSA;
