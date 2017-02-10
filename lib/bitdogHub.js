//-----------------------------------------------------------------------------
//
//	bitdogHub.js
//
//	Copyright (c) 2016 Bitdog LLC.
//
//	SOFTWARE NOTICE AND LICENSE
//
//	This file is part of bitdog-hub.
//
//	bitdog-hub is free software: you can redistribute it and/or modify
//	it under the terms of the GNU General Public License as published
//	by the Free Software Foundation, either version 3 of the License,
//	or (at your option) any later version.
//
//	bitdog-hub is distributed in the hope that it will be useful,
//	but WITHOUT ANY WARRANTY; without even the implied warranty of
//	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//	GNU General Public License for more details.
//
//	You should have received a copy of the GNU General Public License
//	along with bitdog-hub.  If not, see <http://www.gnu.org/licenses/>.
//
//-----------------------------------------------------------------------------


var bitdogClient = require('bitdog-client');
var BitdogZWave = require('./zwave/bitdogZWave.js');
var EventEmitter = require('events').EventEmitter;
var ZwaveScene = require('./zwave/zwaveScene.js');

var util = require('util');
var constants = require('./constants.js');
var coreMessageSchemas = require('./coreMessageSchemas.js');
var bitdogAutomation = require('./automation/bitdogAutomation.js');
var bitdogAlarm = require('./alarm/bitdogAlarm.js');
var bitdogBrain = require('./brains/bitdogBrain.js');
var bitdogZWave = null;
var automationUrl = bitdogClient.constants.CENTRAL_URL + constants.AUTOMATION_PATH;
var zoneUrl = bitdogClient.constants.CENTRAL_URL + constants.AUTOMATION_PATH;

function BitdogHub() {
    var self = this;
    var zwaveConnections = bitdogClient.configuration.get(constants.ZWAVE_CONNECTIONS_CONFIG);
    bitdogClient.applicationName = 'bitdog-hub';

    var enableZWave = typeof zwaveConnections !== typeof undefined && zwaveConnections !== null && zwaveConnections.length > 0;
    
    bitdogClient.on('ready', function () {
        if (enableZWave === true && bitdogZWave === null) {
            bitdogZWave = new BitdogZWave(bitdogClient);
            bitdogZWave.start();

            bitdogBrain.bitdogZWave = bitdogZWave;
            bitdogAlarm.bitdogZWave = bitdogZWave;
            bitdogAutomation.bitdogZWave = bitdogZWave;

            bitdogAutomation.start();

        }
    });
    
    bitdogClient.on('message', function (message) {
        if (enableZWave === true) {
            bitdogBrain.processMessage(message);
        }

        self.emit('message', message, bitdogClient.configuration, bitdogClient.logger);
    });

    if (enableZWave === true) {
        // ZWave data collectors
        bitdogClient.addDataCollector('bd-zValueChanged', coreMessageSchemas.zwaveValueMessageSchema, -1, function (message, configuration, logger) {
        }, true);

        bitdogClient.addDataCollector('bd-zNodeStatus', coreMessageSchemas.zwaveNodeStatusMessageSchema, -1, function (message, configuration, logger) {
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
            bitdogBrain.setTemperature(message.homeId, message.nodeId, message.celsius);
        }, undefined, undefined, true);

        // Scene commands
        bitdogClient.addCommand('bd-zGetScenes', coreMessageSchemas.zwaveGetScenesMessageSchema, function (message, configuration, logger) {
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Get scenes received', message);
            return { value: bitdogZWave.getScenes() };
        }, undefined, undefined, true);

        bitdogClient.addCommand('bd-zGetSceneValues', coreMessageSchemas.zwaveGetSceneValuesMessageSchema, function (message, configuration, logger) {
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Get scene values received', message);
            return { value: bitdogZWave.getSceneValues(message.sceneId) };
        }, undefined, undefined, true);

        bitdogClient.addCommand('bd-zCreateScene', coreMessageSchemas.zwaveCreateSceneMessageSchema, function (message, configuration, logger) {
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Create scene received', message);
            var id = bitdogZWave.createScene(message.label, message.homeId);
            var zwaveScene = new ZwaveScene(message.homeId, id, message.label);
            var parsedValueId = null;

            for (var index = 0; index < message.values.length; index++) {
                parsedValueId = parseValueId(message.values[index].valueId);
                bitdogZWave.addSceneValue(id, parsedValueId.nodeId, parsedValueId.classId, parsedValueId.instanceId, parsedValueId.indexId, message.values[index].value);
            }

            return { value: zwaveScene };

        }, undefined, undefined, true);

        bitdogClient.addCommand('bd-zRemoveScene', coreMessageSchemas.zwaveRemoveSceneMessageSchema, function (message, configuration, logger) {
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Remove scene received', message);
            bitdogZWave.removeScene(message.sceneId);
        }, undefined, undefined, true);

        bitdogClient.addCommand('bd-zAddSceneValue', coreMessageSchemas.zwaveAddSceneValueMessageSchema, function (message, configuration, logger) {
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Add scene value received', message);
            var parsedValueId = parseValueId(message.valueId);
            bitdogZWave.addSceneValue(message.sceneId, parsedValueId.nodeId, parsedValueId.classId, parsedValueId.instanceId, parsedValueId.indexId, message.value);
        }, undefined, undefined, true);

        bitdogClient.addCommand('bd-zRemoveSceneValue', coreMessageSchemas.zwaveRemoveSceneValueMessageSchema, function (message, configuration, logger) {
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Remove scene value received', message);
            var parsedValueId = parseValueId(message.valueId);
            bitdogZWave.removeSceneValue(message.sceneId, parsedValueId.nodeId, parsedValueId.classId, parsedValueId.instanceId, parsedValueId.indexId);
        }, undefined, undefined, true);

    }

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

    bitdogClient.addDataCollector('bd-aStatusChanged', coreMessageSchemas.alarmStatusChangedMessageSchema, -1, function (message, configuration, logger) {
    }, true);

    // Automation commands
    bitdogClient.addCommand('bd-saveAutomations', coreMessageSchemas.saveAutomationsMessageSchema, function (message, configuration, logger) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Save automations received', message);
        configuration.set(constants.AUTOMATIONS_CONFIG, message.a);
        bitdogAutomation.restart();
    }, undefined, undefined, true);

    bitdogClient.addSubscription('*', 'bd-zValueChanged', 'add', function (message, configuration, logger) {
        bitdogAutomation.processMessage(message);
        bitdogAlarm.processMessage(message);

    });

    bitdogClient.addDataCollector('bd-automationExecuted', coreMessageSchemas.automationExecutedMessageSchema, -1, function (message, configuration, logger) {
    }, true);
    
    // Zone commands
    bitdogClient.addCommand('bd-saveZones', coreMessageSchemas.saveZonesMessageSchema, function (message, configuration, logger) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ALARM, 'Save zones received', message);
        configuration.set(constants.ZONES_CONFIG, message.z);
    }, undefined, undefined, true);

    // Location commands
    bitdogClient.addCommand('bd-setGPSLocation', coreMessageSchemas.gpsLocationMessageSchema, function (message, configuration, logger) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Set GPS location received', message);
        configuration.set(constants.AUTOMATIONS_LOCATION, { latitude: message.lat, longitude: message.long } );
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

util.inherits(BitdogHub, EventEmitter);


BitdogHub.prototype.start = function () {
    bitdogClient.start();
};

BitdogHub.prototype.stop = function () {

    bitdogAutomation.stop();

    if (bitdogZWave != null) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Stopping.');
        bitdogZWave.stop();
    }
    
    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_BITDOG_CLIENT, 'Stopping.');
    bitdogClient.stop();
};

BitdogHub.prototype.__defineGetter__('bitdogClient', function () { return bitdogClient; });



// Singleton export
var _bitdogHub = new BitdogHub();
module.exports = _bitdogHub;
