//-----------------------------------------------------------------------------
//
//	constants.js
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



function Constants() {
    ////////////////// Message Classes /////////////////////
    this.MESSAGE_CLASS_ZWAVE_CONFIGURATION = 'zwaveConfiguration';
    this.MESSAGE_CLASS_ZWAVE_SCENE_CONFIGURATION = 'zwaveSceneConfiguration';
    ////////////////// Zwave Message Schema //////////////////////
    this.MESSAGE_SCHEMA_ZWAVE_NODE_STATUS = 'bitdog-zwave-node-status';
    this.MESSAGE_SCHEMA_ZWAVE_VALUE = 'bitdog-zwave-value';
    this.MESSAGE_SCHEMA_ZWAVE_CONFIGURATION = 'bitdog-zwave-configuration';
    this.MESSAGE_SCHEMA_ZWAVE_SCENE_CONFIGURATION = 'bitdog-zwave-scene-configuration';
    this.MESSAGE_SCHEMA_ZWAVE_SET_NODE = 'bitdog-zwave-set-node';
    this.MESSAGE_SCHEMA_ZWAVE_SET_NODE_LEVEL = 'bitdog-zwave-set-node-level';
    this.MESSAGE_SCHEMA_ZWAVE_ACTIVATE = 'bitdog-zwave-activate';
    this.MESSAGE_SCHEMA_ZWAVE_ADD_NODE = 'bitdog-zwave-add-node';
    this.MESSAGE_SCHEMA_ZWAVE_NODE = 'bitdog-zwave-node';
    this.MESSAGE_SCHEMA_ZWAVE_CONTROLLER_COMMAND = 'bitdog-zwave-controller-command';
    this.MESSAGE_SCHEMA_ZWAVE_HEAL_NETWORK_NODE = 'bitdog-zwave-heal-network-node';
    this.MESSAGE_SCHEMA_ZWAVE_RENAME = 'bitdog-zwave-rename';
    this.MESSAGE_SCHEMA_ZWAVE_CONTROLLER_MODE = 'bitdog-zwave-controller-mode';
    
    this.MESSAGE_SCHEMA_ZWAVE_SET_PERCENTAGE = 'bitdog-zwave-set-percentage';
    //this.MESSAGE_SCHEMA_ZWAVE_INCREMENT_PERCENTAGE = 'bitdog-zwave-increment-percentage';
    //this.MESSAGE_SCHEMA_ZWAVE_DECREMENT_PERCENTAGE = 'bitdog-zwave-decrement-percentage';
    this.MESSAGE_SCHEMA_ZWAVE_SET_TEMPERTURE = 'bitdog-zwave-set-temperture';
    this.MESSAGE_SCHEMA_ZWAVE_INCREMENT_DECREMENT_TEMPERTURE = 'bitdog-zwave-increment-decrement-temperture';

    this.MESSAGE_SCHEMA_ZWAVE_CREATE_SCENE = 'bitdog-zwave-create-scene';
    this.MESSAGE_SCHEMA_ZWAVE_REMOVE_SCENE = 'bitdog-zwave-remove-scene';
    this.MESSAGE_SCHEMA_ZWAVE_ADD_SCENE_VALUE = 'bitdog-zwave-add-scene-value';
    this.MESSAGE_SCHEMA_ZWAVE_REMOVE_SCENE_VALUE = 'bitdog-zwave-remove-scene-value';
    this.MESSAGE_SCHEMA_ZWAVE_GET_SCENE_VALUES = 'bitdog-zwave-get-scene-values';
    this.MESSAGE_SCHEMA_ZWAVE_GET_SCENES = 'bitdog-zwave-get-scenes';
    this.MESSAGE_SCHEMA_ZWAVE_SCENE_EVENT = 'bitdog-zwave-scene-event';
    
    //////////////////// Weather Message Schema ///////////////////////////
    this.MESSAGE_SCHEMA_WEATHER_REQUEST = 'bitdog-cloud-weather-request';
    this.MESSAGE_SCHEMA_WEATHER_FORECAST = 'bitdog-cloud-weather-forecast';

    ////////////////// Alarm Message Schema //////////////////////
    this.MESSAGE_SCHEMA_ALARM_ARM_AWAY = 'bitdog-alarm-arm-away';
    this.MESSAGE_SCHEMA_ALARM_ARM_STAY = 'bitdog-alarm-arm-stay';
    this.MESSAGE_SCHEMA_ALARM_DISARM = 'bitdog-alarm-disarm';
    this.MESSAGE_SCHEMA_ALARM_STATUS_CHANGED = 'bitdog-alarm-status-changed';
    this.MESSAGE_SCHEMA_ALARM_EVENT = 'bitdog-alarm-event';

    ////////////////// Automation Message Schema //////////////////////
    this.MESSAGE_SCHEMA_SAVE_AUTOMATIONS = 'bitdog-save-automation';
    this.MESSAGE_SCHEMA_AUTOMATION_EXECUTED = 'bitdog-automation-executed';

    ////////////////// Zone Message Schema //////////////////////
    this.MESSAGE_SCHEMA_SAVE_ZONES = 'bitdog-save-zones';
    this.MESSAGE_SCHEMA_GET_ZONES = 'bitdog-get-zones';

    ///////////////// GPS Message Schema ///////////////////////
    this.MESSAGE_SCHEMA_GPS_LOCATION = 'bitdog-gps-location';
    
    ///////////////// Video Message Schema ///////////////////////
    this.MESSAGE_SCHEMA_VIDEO_SOURCE_SETTINGS = 'bitdog-video-source-settings';
    this.MESSAGE_SCHEMA_GET_VIDEO_SOURCES = 'bitdog-get-video-sources';
    this.MESSAGE_SCHEMA_START_VIDEO_STREAM = 'bitdog-start-video-stream';
    this.MESSAGE_SCHEMA_STOP_VIDEO_STREAM = 'bitdog-stop-video-stream';


    ////////////////// Configuration ////////////////////////////
    this.ZWAVE_CONNECTIONS_CONFIG = 'zwave:connections';
    this.ZONES_CONFIG = 'zone:zones';
    this.AUTOMATIONS_CONFIG = 'automation:automations';
    this.AUTOMATIONS_LOCATION = 'automation:location';
    this.ZWAVE_NETWORKKEY_CONFIG = 'zwave:networkKey';
    this.ZWAVE_NODE_INFORMATION = 'zwave:nodeInformation';
    this.ALARM_NODE = 'alarm:mode';
    this.VIDEO_SOURCES = 'video:sources';

    ////////////////// Extensions ////////////////////////////////
    this.EXTENSION_PATHS = 'extension:paths';
    
    ////////////////// LOGGING //////////////////////////////////
    this.LOG_PROCESS_BITDOG_SA = 'BitdogHub';
    this.LOG_PROCESS_ZWAVE = 'ZWave';
    this.LOG_PROCESS_BITDOG_CLIENT = 'Bitdog Client';
    this.LOG_PROCESS_ALARM = 'Alarm';
    this.LOG_PROCESS_BRAIN = 'Brain';
    this.LOG_PROCESS_AUTOMATION = 'Automation';
    this.LOG_PROCESS_VIDEO_STREAMER = 'Video Streamer';
    this.LOG_PROCESS_VIDEO_MANAGER = 'Video Manager';

    //////////////// CLOUD NODES ////////////////////////////////
    this.BITDOG_CLOUD_NODE = "00000000-0000-0000-0000-000000000005"
}

module.exports = new Constants();  