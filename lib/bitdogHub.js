var bitdogClient = require('bitdog-client');
var BitdogZWave = require('./zwave/bitdogZWave.js');
var EventEmitter = require('events').EventEmitter;

var util = require('util');
var constants = require('./constants.js');
var coreMessageSchemas = require('./coreMessageSchemas.js');
var bitdogAutomation = require('./automation/bitdogAutomation.js');
var bitdogAlarm = require('./alarm/bitdogAlarm.js');
var brain = require('./brains/brain.js');
var bitdogZWave = null;
var automationUrl = bitdogClient.constants.CENTRAL_URL + constants.AUTOMATION_PATH;
var zoneUrl = bitdogClient.constants.CENTRAL_URL + constants.AUTOMATION_PATH;

function bitdogHub() {
   
    bitdogClient.applicationName = 'bitdog-hub';
    
    bitdogClient.on('ready', function () {
        if (bitdogZWave === null) {
            bitdogZWave = new BitdogZWave(bitdogClient);
            bitdogZWave.start();
            brain.bitdogZWave = bitdogZWave;
        }
    });
    
    bitdogClient.on('message', function (message) {
        brain.processMessage(message);
        bitdogAlarm.processMessage(message);
        bitdogAutomation.processMessage(message);
    });
    
    // ZWave data collectors
    bitdogClient.addDataCollector('bd-zValueChanged', coreMessageSchemas.zwaveValueMessageSchema , -1, function (message, configuration, logger) { 
    }, true);
    
    bitdogClient.addDataCollector('bd-zNodeStatus', coreMessageSchemas.zwaveNodeStatusMessageSchema , -1, function (message, configuration, logger) { 
    }, true);

    bitdogClient.addDataCollector('bd-zNodeFound', coreMessageSchemas.zwaveNodeMessageSchema, -1, function (message, configuration, logger) {
    }, true);

    bitdogClient.addDataCollector('bd-zNodeRemoved', coreMessageSchemas.zwaveNodeMessageSchema, -1, function (message, configuration, logger) {
    }, true);

    bitdogClient.addDataCollector('bd-zControllerModeChanged', coreMessageSchemas.zwaveControllerModeMessageSchema, -1, function (message, configuration, logger) {
    }, true);
    
    // ZWave commands
    bitdogClient.addCommand('bd-zSetNodeName', coreMessageSchemas.zwaveRenameMessageSchema, function (message, configuration, logger) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Set node name command received', message);
        bitdogZWave.setNodeName(message.homeId, message.nodeId, message.name);
    }, undefined, undefined, true);
    
    bitdogClient.addCommand('bd-zSetNodeLocation', coreMessageSchemas.zwaveRenameMessageSchema, function (message, configuration, logger) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Set node location command received', message);
        bitdogZWave.setNodeLocation(message.homeId, message.nodeId, message.name);
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
    
    bitdogClient.addCommand('bd-zRequestAllConfigParams', coreMessageSchemas.zwaveSetNodeMessageSchema, function (message, configuration, logger) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Request all configuration parameters command received', { homeId: message.homeId, nodeId: message.nodeId });
        bitdogZWave.requestAllConfigParams(message.nodeId);
    }, undefined, undefined, true);
    
    bitdogClient.addCommand('bd-zSetLevel', coreMessageSchemas.zwaveSetNodeLevelMessageSchema, function (message, configuration, logger) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Set node level command received', { homeId: message.homeId, nodeId: message.nodeId, value: message.value });
        bitdogZWave.setNodeLevel(message.nodeId, message.value);
    }, undefined, undefined, true);
    
    bitdogClient.addCommand('bd-zPressButton', coreMessageSchemas.zwaveActivateMessageSchema, function (message, configuration, logger) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Press button command received', { homeId: message.homeId, nodeId: message.nodeId, class_id: message.classId, instance: message.instanceId, index: message.index });
        bitdogZWave.pressButton(message.nodeId, message.classId, message.instanceId, message.index);
    }, undefined, undefined, true);
    
    bitdogClient.addCommand('bd-zReleaseButton', coreMessageSchemas.zwaveActivateMessageSchema, function (message, configuration, logger) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Release button command received', { homeId: message.homeId, nodeId: message.nodeId, class_id: message.classId, instance: message.instanceId, index: message.index });
        bitdogZWave.releaseButton(message.nodeId, message.classId, message.instanceId, message.index);
    }, undefined, undefined, true);
    
    // Controller Commands
    bitdogClient.addCommand('bd-zAddNode', coreMessageSchemas.zwaveAddNodeMessageSchema, function (message, configuration, logger) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Add node command received', message);
        bitdogZWave.addNode(message.withSecurity);
    }, undefined, undefined, true);
    
    bitdogClient.addCommand('bd-zRemoveNode', coreMessageSchemas.zwaveControllerCommandMessageSchema, function (message, configuration, logger) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Remove node command received', message);
        bitdogZWave.removeNode();
    }, undefined, undefined, true);
    
    bitdogClient.addCommand('bd-zCancelControllerCommand', coreMessageSchemas.zwaveControllerCommandMessageSchema, function (message, configuration, logger) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Cancel controller command received', message);
        bitdogZWave.cancelControllerCommand();
    }, undefined, undefined, true);
    
    bitdogClient.addCommand('bd-zRemoveFailedNode', coreMessageSchemas.zwaveSetNodeMessageSchema, function (message, configuration, logger) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Remove failed node command received', { homeId: message.homeId, nodeId: message.nodeId });
        bitdogZWave.removeFailedNode(message.nodeId);
    }, undefined, undefined, true);
    
    bitdogClient.addCommand('bd-zHardResetController', coreMessageSchemas.zwaveControllerCommandMessageSchema, function (message, configuration, logger) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Hard reset controller command received', { homeId: message.homeId });
        bitdogZWave.hardResetController();
    }, undefined, undefined, true);
    
    bitdogClient.addCommand('bd-zSoftResetController', coreMessageSchemas.zwaveControllerCommandMessageSchema, function (message, configuration, logger) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Soft reset controller command received', { homeId: message.homeId });
        bitdogZWave.softResetController();
    }, undefined, undefined, true);
    
    bitdogClient.addCommand('bd-zHealNetwork', coreMessageSchemas.zwaveControllerCommandMessageSchema, function (message, configuration, logger) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Heal network command received', { homeId: message.homeId });
        bitdogZWave.healNetwork();
    }, undefined, undefined, true);
    
    bitdogClient.addCommand('bd-zHealNetworkNode', coreMessageSchemas.zwaveHealNetworkNodeMessageSchema, function (message, configuration, logger) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Heal network node received', { homeId: message.homeId, nodeId: message.nodeId, doReturnRoutes: message.doReturnRoutes });
        bitdogZWave.healNetworkNode(message.nodeId, message.doReturnRoutes);
    }, undefined, undefined, true);
    
    // Thermostat commands
    bitdogClient.addCommand('bd-zSetTemperature', coreMessageSchemas.zwaveSetTempertureMessageSchema, function (message, configuration, logger) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Set temperature received', message);
        brain.setTemperature(message.homeId, message.nodeId, message.celsius);
    }, undefined, undefined, true);
    

    // Alarm commands
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

util.inherits(bitdogHub, EventEmitter);

bitdogHub.prototype.start = function () {
    bitdogClient.start();
};

bitdogHub.prototype.stop = function () {

    if (bitdogZWave != null) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Stopping.');
        bitdogZWave.stop();
    }
    
    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_BITDOG_CLIENT, 'Stopping.');
    bitdogClient.stop();
};

bitdogHub.prototype.addCommand = function (name, messageSchema, executeCallback, startCallback, stopCallback) {
    return bitdogClient.addCommand(name, messageSchema, executeCallback, startCallback, stopCallback, false);
};

bitdogHub.prototype.addDataCollector = function (name, messageSchema, intervalMilliseconds, collectCallback) {
    return bitdogClient.addDataCollector(name, messageSchema, intervalMilliseconds, collectCallback, false)
};

bitdogHub.prototype.createMessageSchema(name) {
    return bitdogClient.createMessageSchema(name);
}


// Singleton export
var _bitdogHub = new bitdogHub();
module.exports = _bitdogHub;
