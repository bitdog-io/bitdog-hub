//-----------------------------------------------------------------------------
//
//	bitdogHub.js
//
//	Copyright (c) 2015-2017 Bitdog LLC.
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

var childProcess = require('child_process');
var bitdogClient = require('bitdog-client');
var SystemEvents = require('./systemEvents.js');
var BitdogZWave = require('./zwave/bitdogZWave.js');
var EventEmitter = require('events').EventEmitter;
var ZwaveScene = require('./zwave/zwaveScene.js');
var util = require('util');
var constants = require('./constants.js');
var coreMessageSchemas = require('./coreMessageSchemas.js');
var bitdogAutomation = require('./automation/bitdogAutomation.js');
var bitdogAlarm = require('./alarm/bitdogAlarm.js');
var bitdogBrain = require('./brains/bitdogBrain.js');
var videoManager = require('./cameras/videoManager.js');
var ipcManager = require('./ipcManager.js');
var bitdogZWave = null;
var automationUrl = bitdogClient.constants.CENTRAL_URL + constants.AUTOMATION_PATH;
var zoneUrl = bitdogClient.constants.CENTRAL_URL + constants.AUTOMATION_PATH;
var systemEvents = null;
var alarmMode = require('./alarm/alarmMode.js');


function BitdogHub() {
    var self = this;

    // First look to find if there is a detectable ZWave USB controller attached
    this.detectSigmaDesignsUSB();

    // Get any previously known zwave controller configurations from the config file 
    var zwaveConnections = bitdogClient.configuration.get(constants.ZWAVE_CONNECTIONS_CONFIG);

    // Check if video option is enabled in the config file
    var videoEnabled = bitdogClient.configuration.get(constants.VIDEO_ENABLED);

    // Setup the system event broadcasting system
    systemEvents = new SystemEvents(this, bitdogClient.configuration, bitdogClient.logger);

    bitdogClient.applicationName = 'bitdog-hub';

    // Check to see if we found any zwave controller connections, if so, initialize the rest of the zwave code.
    var enableZWave = typeof zwaveConnections !== typeof undefined && zwaveConnections !== null && zwaveConnections.length > 0;

    // The Bitdog client connects to the Bitdog cloud. This event fires when it is connected and ready
    bitdogClient.on('ready', function () {

        // Start listening for local http messages from other processes
        ipcManager.start();

        // If we have video enabled in the config file then start the video manager
        if (videoEnabled === true) {
            videoManager.start();
        }

        // If we have zwave enabled
        if (enableZWave === true && bitdogZWave === null) {

            // Start new zwave client
            bitdogZWave = new BitdogZWave(bitdogClient);

            // Attach scan complete handler
            bitdogZWave.on('scan complete', function () {
                systemEvents.publishZWaveScanEnd();

                bitdogAutomation.start();
                var previousAlarmMode = bitdogClient.configuration.get(constants.ALARM_NODE);

                if (typeof previousAlarmMode !== typeof undefined && previousAlarmMode != null) {
                    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ALARM, 'Returning to previous alarm mode', previousAlarmMode);

                    switch (previousAlarmMode) {
                        case alarmMode.away: {
                            systemEvents.publishSecurityArmAway();
                            bitdogAlarm.armAway({ reason: 'Hub restart' });
                            break;
                        }
                        case alarmMode.stay: {
                            systemEvents.publishSecurityArmStay();
                            bitdogAlarm.armStay({ reason: 'Hub restart' });
                            break;
                        }
                    }
                }

                systemEvents.publishSystemReady();
            });

            bitdogZWave.on('node removed', function (zwaveNode) {
                systemEvents.publishZWaveRemoveNode(zwaveNode);
            });

            bitdogZWave.on('node added', function (zwaveNode) {
            });

            bitdogBrain.bitdogZWave = bitdogZWave;

            bitdogBrain.on('node added', function (zwaveNode) {
                systemEvents.publishZWaveAddNode(zwaveNode);
            }); 

            bitdogAlarm.bitdogZWave = bitdogZWave;
            bitdogAutomation.bitdogZWave = bitdogZWave;

            systemEvents.publishZWaveScanBegin();
            bitdogZWave.start();

        } else {
            bitdogAutomation.start();
            // Broadcast that the event publishing system is ready
            systemEvents.publishSystemReady();
        }
    });

    // Messages that go between the hub and cloud are handled by this event
    bitdogClient.on('message', function (message) {
        if (enableZWave === true) {
            bitdogBrain.processMessage(message);
        }

        self.emit('message', message, bitdogClient.configuration, bitdogClient.logger);
    });

    // If zwave is enabled, configure all the additional zwave cloud messages that this hub can support
    if (enableZWave === true) {
        // Bitdog client method 'addData' registers data messages with the cloud
        bitdogClient.addData('bd-zValueChanged', coreMessageSchemas.zwaveValueMessageSchema, true);

        bitdogClient.addData('bd-zNodeStatus', coreMessageSchemas.zwaveNodeStatusMessageSchema, true);

        bitdogClient.addData('bd-zNodeFound', coreMessageSchemas.zwaveNodeMessageSchema, true);

        bitdogClient.addData('bd-zNodeRemoved', coreMessageSchemas.zwaveNodeMessageSchema, true);

        bitdogClient.addData('bd-zControllerModeChanged', coreMessageSchemas.zwaveControllerModeMessageSchema, true);

        bitdogClient.addData('bd-zConfigurationUpdate', coreMessageSchemas.zwaveConfigurationUpdateMessageSchema, true);

        // Bitdog client method 'addCommand' registers commands that can be invoked on this hub by the cloud
        // Add specific zwave commands, mostly exposing openzwave-shared api
        bitdogClient.addCommand('bd-zSetNodeName', coreMessageSchemas.zwaveRenameMessageSchema, function (message, configuration, logger) {
            logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Set node name command received', message);
            bitdogZWave.setNodeName(message.homeId, message.nodeId, message.name);
        }, undefined, undefined, true);

        bitdogClient.addCommand('bd-zSetNodeLocation', coreMessageSchemas.zwaveRenameMessageSchema, function (message, configuration, logger) {
            logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Set node location command received', message);
            bitdogZWave.setNodeLocation(message.homeId, message.nodeId, message.name);
        }, undefined, undefined, true);

        bitdogClient.addCommand('bd-zSetValue', coreMessageSchemas.zwaveValueMessageSchema, function (message, configuration, logger) {
            logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Set value command received', message);
            var parsedValueId = parseValueId(message.valueId);
            bitdogZWave.setValue(parsedValueId.nodeId, parsedValueId.classId, parsedValueId.instanceId, parsedValueId.indexId, message.value);
        }, undefined, undefined, true);
        
        bitdogClient.addCommand('bd-zEnablePolling', coreMessageSchemas.zwaveEnablePollingMessageSchema, function (message, configuration, logger) {
            logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Enable polling command received', message);
            var parsedValueId = parseValueId(message.valueId);
            var result = bitdogZWave.enablePolling(parsedValueId.nodeId, parsedValueId.classId, parsedValueId.instanceId, parsedValueId.indexId, message.intensity);
            return { value: result };
        }, undefined, undefined, true);
        
        bitdogClient.addCommand('bd-zDisablePolling', coreMessageSchemas.zwaveDisablePollingMessageSchema, function (message, configuration, logger) {
            logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Disable polling command received', message);
            var parsedValueId = parseValueId(message.valueId);
            var result = bitdogZWave.disablePolling(parsedValueId.nodeId, parsedValueId.classId, parsedValueId.instanceId, parsedValueId.indexId)        ;
            return { value: result };
        }, undefined, undefined, true);

        bitdogClient.addCommand('bd-zTurnOn', coreMessageSchemas.zwaveSetNodeMessageSchema, function (message, configuration, logger) {
            logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Set node on command received', { homeId: message.homeId, nodeId: message.nodeId });
            bitdogZWave.setNodeOn(message.nodeId);
        }, undefined, undefined, true);

        bitdogClient.addCommand('bd-zTurnOff', coreMessageSchemas.zwaveSetNodeMessageSchema, function (message, configuration, logger) {
            logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Set node off command received', { homeId: message.homeId, nodeId: message.nodeId });
            bitdogZWave.setNodeOff(message.nodeId);
        }, undefined, undefined, true);

        bitdogClient.addCommand('bd-zRequestAllConfigParams', coreMessageSchemas.zwaveSetNodeMessageSchema, function (message, configuration, logger) {
            logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Request all configuration parameters command received', { homeId: message.homeId, nodeId: message.nodeId });
            bitdogZWave.requestAllConfigParams(message.nodeId);
        }, undefined, undefined, true);

        bitdogClient.addCommand('bd-zSetLevel', coreMessageSchemas.zwaveSetNodeLevelMessageSchema, function (message, configuration, logger) {
            logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Set node level command received', { homeId: message.homeId, nodeId: message.nodeId, value: message.value });
            bitdogZWave.setNodeLevel(message.nodeId, message.value);
        }, undefined, undefined, true);

        bitdogClient.addCommand('bd-zPressButton', coreMessageSchemas.zwaveActivateMessageSchema, function (message, configuration, logger) {
            logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Press button command received', { homeId: message.homeId, nodeId: message.nodeId, class_id: message.classId, instance: message.instanceId, index: message.index });
            bitdogZWave.pressButton(message.nodeId, message.classId, message.instanceId, message.index);
        }, undefined, undefined, true);

        bitdogClient.addCommand('bd-zReleaseButton', coreMessageSchemas.zwaveActivateMessageSchema, function (message, configuration, logger) {
            logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Release button command received', { homeId: message.homeId, nodeId: message.nodeId, class_id: message.classId, instance: message.instanceId, index: message.index });
            bitdogZWave.releaseButton(message.nodeId, message.classId, message.instanceId, message.index);
        }, undefined, undefined, true);

        // Controller Commands
        bitdogClient.addCommand('bd-zAddNode', coreMessageSchemas.zwaveAddNodeMessageSchema, function (message, configuration, logger) {
            logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Add node command received', message);
            bitdogZWave.addNode(message.withSecurity);
        }, undefined, undefined, true);

        bitdogClient.addCommand('bd-zRemoveNode', coreMessageSchemas.zwaveControllerCommandMessageSchema, function (message, configuration, logger) {
            logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Remove node command received', message);
            bitdogZWave.removeNode();
        }, undefined, undefined, true);

        bitdogClient.addCommand('bd-zCancelControllerCommand', coreMessageSchemas.zwaveControllerCommandMessageSchema, function (message, configuration, logger) {
            logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Cancel controller command received', message);
            bitdogZWave.cancelControllerCommand();
        }, undefined, undefined, true);

        bitdogClient.addCommand('bd-zRemoveFailedNode', coreMessageSchemas.zwaveSetNodeMessageSchema, function (message, configuration, logger) {
            logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Remove failed node command received', { homeId: message.homeId, nodeId: message.nodeId });
            bitdogZWave.removeFailedNode(message.nodeId);
        }, undefined, undefined, true);

        bitdogClient.addCommand('bd-zHardResetController', coreMessageSchemas.zwaveControllerCommandMessageSchema, function (message, configuration, logger) {
            logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Hard reset controller command received', { homeId: message.homeId });
            bitdogZWave.hardResetController();
        }, undefined, undefined, true);

        bitdogClient.addCommand('bd-zSoftResetController', coreMessageSchemas.zwaveControllerCommandMessageSchema, function (message, configuration, logger) {
            logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Soft reset controller command received', { homeId: message.homeId });
            bitdogZWave.softResetController();
        }, undefined, undefined, true);

        bitdogClient.addCommand('bd-zHealNetwork', coreMessageSchemas.zwaveControllerCommandMessageSchema, function (message, configuration, logger) {
            logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Heal network command received', { homeId: message.homeId });
            bitdogZWave.healNetwork();
        }, undefined, undefined, true);

        bitdogClient.addCommand('bd-zHealNetworkNode', coreMessageSchemas.zwaveHealNetworkNodeMessageSchema, function (message, configuration, logger) {
            logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Heal network node received', { homeId: message.homeId, nodeId: message.nodeId, doReturnRoutes: message.doReturnRoutes });
            bitdogZWave.healNetworkNode(message.nodeId, message.doReturnRoutes);
        }, undefined, undefined, true);

        // Thermostat commands
        bitdogClient.addCommand('bd-zSetTemperature', coreMessageSchemas.zwaveSetTempertureMessageSchema, function (message, configuration, logger) {
            logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Set temperature received', message);
            bitdogBrain.setTemperature(message.homeId, message.nodeId, message.celsius);
        }, undefined, undefined, true);

        // Scene commands
        bitdogClient.addCommand('bd-zGetScenes', coreMessageSchemas.zwaveGetScenesMessageSchema, function (message, configuration, logger) {
            logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Get scenes received', message);
            var scenes = bitdogZWave.getScenes();
            var scene = null;
            var zwaveScenes = [];
            var values = null;
            var sceneValues = null;

            for (var index = 0; index < scenes.length; index++) {
                scene = scenes[index];
                sceneValues = []
                values = bitdogZWave.getSceneValues(scene.sceneid);

                for (var valueIndex = 0; valueIndex < values.length; valueIndex++) {
                    sceneValues.push({ valueId: values[valueIndex].value_id, value: values[valueIndex].value });
                }
                zwaveScenes.push(new ZwaveScene(message.homeId, scene.sceneid, scene.label, sceneValues ));
            }
            
            return { value: zwaveScenes };

        }, undefined, undefined, true);

        bitdogClient.addCommand('bd-zGetSceneValues', coreMessageSchemas.zwaveGetSceneValuesMessageSchema, function (message, configuration, logger) {
            logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Get scene values received', message);
            return { value: bitdogZWave.getSceneValues(message.sceneId) };
        }, undefined, undefined, true);

        bitdogClient.addCommand('bd-zCreateScene', coreMessageSchemas.zwaveCreateSceneMessageSchema, function (message, configuration, logger) {
            logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Create scene received', message);
            var id = bitdogZWave.createScene(message.homeId, message.label);
            var zwaveScene = new ZwaveScene(message.homeId, id, message.label);
            var parsedValueId = null;

            for (var index = 0; index < message.values.length; index++) {
                parsedValueId = parseValueId(message.values[index].valueId);
                bitdogZWave.addSceneValue(id, parsedValueId.nodeId, parsedValueId.classId, parsedValueId.instanceId, parsedValueId.indexId, message.values[index].value);
            }

            return { value: zwaveScene };

        }, undefined, undefined, true);

        bitdogClient.addCommand('bd-zRemoveScene', coreMessageSchemas.zwaveRemoveSceneMessageSchema, function (message, configuration, logger) {
            logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Remove scene received', message);
            bitdogZWave.removeScene(message.sceneId);
        }, undefined, undefined, true);

        bitdogClient.addCommand('bd-zAddSceneValue', coreMessageSchemas.zwaveAddSceneValueMessageSchema, function (message, configuration, logger) {
            logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Add scene value received', message);
            var parsedValueId = parseValueId(message.valueId);
            bitdogZWave.addSceneValue(message.sceneId, parsedValueId.nodeId, parsedValueId.classId, parsedValueId.instanceId, parsedValueId.indexId, message.value);
        }, undefined, undefined, true);

        bitdogClient.addCommand('bd-zRemoveSceneValue', coreMessageSchemas.zwaveRemoveSceneValueMessageSchema, function (message, configuration, logger) {
            logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Remove scene value received', message);
            var parsedValueId = parseValueId(message.valueId);
            bitdogZWave.removeSceneValue(message.sceneId, parsedValueId.nodeId, parsedValueId.classId, parsedValueId.instanceId, parsedValueId.indexId);
        }, undefined, undefined, true);

        bitdogClient.addData('bd-zSceneEvent', coreMessageSchemas.zwaveSceneEventMessageSchema, true);

    }

    // Alarm commands
    // Register standard alarm system commands and event data messages
    bitdogClient.addCommand({ name: 'bd-alarmArmAway', displayName: 'Alarm Arm Away' }, coreMessageSchemas.alarmArmAwayMessageSchema, function (message, configuration, logger, context, header) {
        logger.logProcessEvent(constants.LOG_PROCESS_ALARM, 'Arm away received', message);
        bitdogAlarm.armAway({ c: context, d: message, h: header });
         systemEvents.publishSecurityArmAway();
   }, undefined, undefined, false);
    
    bitdogClient.addCommand({ name: 'bd-alarmArmStay', displayName: 'Alarm Arm Stay' }, coreMessageSchemas.alarmArmStayMessageSchema, function (message, configuration, logger, context, header) {
        logger.logProcessEvent(constants.LOG_PROCESS_ALARM, 'Arm stay received', message);
        bitdogAlarm.armStay({ c: context, d: message, h: header });
        systemEvents.publishSecurityArmStay();
    }, undefined, undefined, false);
    
    bitdogClient.addCommand({ name: 'bd-alarmDisarm', displayName: 'Alarm Disarm' }, coreMessageSchemas.alarmDisarmMessageSchema, function (message, configuration, logger, context, header) {
        logger.logProcessEvent(constants.LOG_PROCESS_ALARM, 'Arm disarm received', message);
        bitdogAlarm.disarm({ c: context, d: message, h: header });
        systemEvents.publishSecurityDisarmed();
    }, undefined, undefined, false);

    bitdogClient.addDataCollector({ name: 'bd-alarmStatus', displayName: 'Alarm Status' }, coreMessageSchemas.alarmStatusMessageSchema, 1000 * 60 * 10, function (message, configuration, logger) {
        message.alarmMode = bitdogAlarm.alarmMode;
    }, false);

    bitdogClient.addData({ name: 'bd-alarmEvent', displayName: 'Alarm Event' }, coreMessageSchemas.alarmEventMessageSchema, false);

    // Automation commands
    bitdogClient.addCommand('bd-saveAutomations', coreMessageSchemas.saveAutomationsMessageSchema, function (message, configuration, logger) {
        logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Save automations received', message);
        configuration.set(constants.AUTOMATIONS_CONFIG, message.a);
        bitdogAutomation.restart();
    }, undefined, undefined, true);

    bitdogClient.addSubscription('*', '*', 'add', function (message, configuration, logger) {
        bitdogAutomation.processMessage(message);
        bitdogAlarm.processMessage(message);

    });

    bitdogClient.addData('bd-automationExecuted', coreMessageSchemas.automationExecutedMessageSchema, true);
   
    // Zone commands
    bitdogClient.addCommand('bd-saveZones', coreMessageSchemas.saveZonesMessageSchema, function (message, configuration, logger) {
        logger.logProcessEvent(constants.LOG_PROCESS_ALARM, 'Save zones received', message);
        configuration.set(constants.ZONES_CONFIG, message.z);
    }, undefined, undefined, true);

    bitdogClient.addCommand('bd-getZones', coreMessageSchemas.getZonesMessageSchema, function (message, configuration, logger) {
        logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Get zones received', message);
        return { value: configuration.get(constants.ZONES_CONFIG) };
    }, undefined, undefined, true);


    // Location commands
    bitdogClient.addCommand('bd-setGPSLocation', coreMessageSchemas.gpsLocationMessageSchema, function (message, configuration, logger) {
        logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Set GPS location received', message);
        configuration.set(constants.AUTOMATIONS_LOCATION, { latitude: message.lat, longitude: message.long } );
    }, undefined, undefined, true);
    
    // Weather Data
    bitdogClient.addData({ name: 'bd-weatherForecast', displayName: 'Weather Forecast' }, coreMessageSchemas.weatherForecastMessageSchema, false);
    
    // Video 
    
    bitdogClient.addCommand('bd-getVideoSourceSettings', coreMessageSchemas.videoSourceSettingsMessageSchema, function (message, configuration, logger) {
 

    }, undefined, undefined, true);
    

    bitdogClient.addData({ name: 'bd-videoMotionEventStart', displayName: 'Motion Event Start' }, coreMessageSchemas.videoMotionEventStartMessageSchema, false);

    bitdogClient.addData({ name: 'bd-videoMotionEventEnd', displayName: 'Motion Event End' }, coreMessageSchemas.videoMotionEventEndMessageSchema, false);

    bitdogClient.addData({ name: 'bd-videoMotionImageCaptured', displayName: 'Motion Image Captured' }, coreMessageSchemas.videoMotionImageCapturedMessageSchema, false);

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

    systemEvents.publishSystemStart();

    bitdogClient.start();
};

BitdogHub.prototype.stop = function () {

    systemEvents.publishSystemStop();

    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_IPC_MANAGER, 'Stopping.');
    ipcManager.stop();

    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_BITDOG_CLIENT, 'Stopping.');
    bitdogClient.stop();   
     
    bitdogAutomation.stop();

    if (bitdogZWave != null) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Stopping.');
        bitdogZWave.stop();
    }
    
    videoManager.stop();


};

BitdogHub.prototype.detectSigmaDesignsUSB = function () {
    var sigmaVendorId = '0658';
    var result = childProcess.execFileSync('dmesg', { encoding: 'utf8' });
    var lines = result.split('\n');
    var capture = null;
    var regex = null;
    var usbIds = [];
    var ttyIds = bitdogClient.configuration.get(constants.ZWAVE_CONNECTIONS_CONFIG);
    var devicePath = null;
    
    if (typeof ttyIds === typeof undefined)
        ttyIds = [];

    for (var index = 0; index < lines.length; index++) {
        regex = new RegExp('[\\s\\S]*usb\\s*([\\w-.]*):.*idVendor=' + sigmaVendorId);
        capture = regex.exec(lines[index]);
        if (capture !== null && capture.length > 1) {
            usbIds.push(capture[1]);
        }
    }
    
    for (var deviceIndex = 0; deviceIndex < usbIds.length; deviceIndex++) {
        for (index = 0; index < lines.length; index++) {
            regex = new RegExp('[\\s\\S]*' + usbIds[deviceIndex].replace('.', '\\.') + '[\\s\\S]*:\\s*(tty.*):');
            capture = regex.exec(lines[index]);
            if (capture !== null && capture.length > 1) {
                devicePath = '/dev/' + capture[1];
                
                if (!ttyIds.includes(devicePath)) {
                    ttyIds.push(devicePath);
                    bitdogClient.logger.logProcessEvent('Bitdog Hub', 'Found Sigma Designs USB tty device', { path: devicePath });
                    break;
                }
            }
        }
    }
    
    bitdogClient.configuration.set(constants.ZWAVE_CONNECTIONS_CONFIG, ttyIds);

};

BitdogHub.prototype.__defineGetter__('bitdogClient', function () { return bitdogClient; });



// Singleton export
var _bitdogHub = new BitdogHub();
module.exports = _bitdogHub;
