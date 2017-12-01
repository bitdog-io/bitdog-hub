//-----------------------------------------------------------------------------
//
//	bitdogAlarm.js
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



var EventProcessor = require('../eventProcessor.js').EventProcessor;
var Zone = require('./zone.js');
var util = require('util');
var bitdogClient = require('bitdog-client');
var alarmMode = require('./alarmMode.js');
var coreMessageSchemas = require('../coreMessageSchemas.js');
var constants = require('../constants.js');


function BitdogAlarm() {
    var _zones = [];
    var _bitdogZWave = null;
    var _alarmMode = alarmMode.disarmed;
    var _monitoredDevices = {};
    var _isAlarmed = false;

    this.__defineGetter__('zones', function () { return _zones; });
    this.__defineSetter__('zones', function (value) { _zones = value; });

    this.__defineGetter__('alarmMode', function () { return _alarmMode; });

    this.__defineSetter__('alarmMode', function (value) {
        if (typeof value !== typeof undefined && value !== null && _alarmMode !== value) {
            _alarmMode = value;

            bitdogClient.sendData('bd-alarmStatus', coreMessageSchemas.alarmStatusMessageSchema, function (message) {
                message.alarmMode = value;
            });

        }
    });


    this.__defineGetter__('monitoredDevices', function () { return _monitoredDevices; });
    this.__defineSetter__('monitoredDevices', function (value) { _monitoredDevices = value; });

    this.__defineGetter__('isAlarmed', function () { return _isAlarmed; });
    this.__defineSetter__('isAlarmed', function (value) { _isAlarmed = value; });

    // Pass in the external zwave controller instance
    this.__defineGetter__('bitdogZWave', function () { return _bitdogZWave; });
    this.__defineSetter__('bitdogZWave', function (value) { _bitdogZWave = value; });

}

util.inherits(BitdogAlarm, EventProcessor);

BitdogAlarm.prototype.onProcessMessage = function (message) {
    var key = null;
    var zones = null;
    var nodeDisplayName = null;

    // We need to do full processing of the event
    // Even if the system is not armed for burglar because a safety event may occur
    if (message.c.n === bitdogClient.configuration.nodeId && typeof message.h !== typeof undefined && message.h !== null && message.h.n === 'bd-zValueChanged') {
        if (typeof message.d !== typeof undefined && message.d !== null && typeof message.d.homeId !== typeof undefined && message.d.homeId !== null) {
            // key is hub id / home id / zwave device id
            key = message.c.n + '/' + message.d.homeId + '/' + message.d.nodeId;

            // See if this device is associated to any zones by its unique key
            zones = this.monitoredDevices[key];

            // Get the zwave devices display name
            nodeDisplayName = this.bitdogZWave.getNodeDisplayName(message.d.nodeId);

            // 'message.d.status & 1 === 1' is a bit check for the burglar bit in status - reference zwaveAlarmNotification.js
            // 'message.d.status & 16 === 16' is a bit check for the burglar event bit in status
            // burglar bit indicates a value that is stateful, like window open
            // burglarEvent bit indicates a transient event like keypad key pressed
            // statefulness matters because in the user interface we want to show a state of the device
            // a locked lock shows its state as ok from a security stand point, but a key pad press can set off alarm even though the door is still locked
            if (typeof zones !== typeof undefined) {

                // burglarAlarm or burglarEventAlarm
                if (((message.d.status & 1) === 1) || ((message.d.status & 16) === 16)) {
                    if (this.alarmMode != alarmMode.disarmed) {
                        this.isAlarmed = true;


                        bitdogClient.sendData('bd-alarmEvent', coreMessageSchemas.alarmEventMessageSchema, function (newMessage) {
                            newMessage.status = alarmMode.securityAlarm;
                            newMessage.event = message;
                            newMessage.zones = zones.map(function (zone) {
                                return { name: zone.name, id: zone.id };
                            });
                            newMessage.device = nodeDisplayName;

                            if (typeof message.d.value !== typeof undefined && message.d.value !== null)
                                newMessage.value = message.d.value.toString();
                        });
                    }
                }

                // safety alarm should fire even when the system is not armed
                if ((message.d.status & 8) === 8) {
                    this.isAlarmed = true;

                    bitdogClient.sendData('bd-alarmEvent', coreMessageSchemas.alarmEventMessageSchema, function (newMessage) {
                        newMessage.status = alarmMode.safetyAlarm;
                        newMessage.event = message;
                        newMessage.zones = zones.map(function (zone) {
                            return { name: zone.name, id: zone.id };
                        });
                        newMessage.device = nodeDisplayName;

                        if (typeof message.d.value !== typeof undefined && message.d.value !== null)
                            newMessage.value = message.d.value.toString();

                    });
                }
            }
        }
    } else {

        if (message.c.n === bitdogClient.configuration.nodeId && typeof message.h !== typeof undefined && message.h !== null && (message.h.n === 'bd-videoMotionEventStart')) {

            // source path not supported yet, only one camera at the moment.
            key = message.c.n + '//dev/video1';  //      + '//' + message.d.sourcePath;

            // See if this device is associated to any zones by its unique key
            zones = this.monitoredDevices[key];

            if (typeof zones !== typeof undefined) {

                if (this.alarmMode != alarmMode.disarmed) {
                    this.isAlarmed = true;

                    bitdogClient.sendData('bd-alarmEvent', coreMessageSchemas.alarmEventMessageSchema, function (newMessage) {
                        newMessage.status = alarmMode.securityAlarm;
                        newMessage.event = message;
                        newMessage.zones = zones.map(function (zone) {
                            return { name: zone.name, id: zone.id };
                        });
                        newMessage.value = 'Video Motion Detected';
                    });
                }

            }

        }

    }
}



BitdogAlarm.prototype.armAway = function (message) {

    if (this.alarmMode !== alarmMode.away) {
        this.alarmMode = alarmMode.away;   // set mode before loading zones, it matters
        this.loadZones();

        bitdogClient.configuration.set(constants.ALARM_NODE, this.alarmMode);

    }

    bitdogClient.sendData('bd-alarmEvent', coreMessageSchemas.alarmEventMessageSchema, function (newMessage) {
        newMessage.status = alarmMode.alarmClear;
        newMessage.event = message;
    });

    this.isAlarmed = false;
};

BitdogAlarm.prototype.armStay = function (message) {

    if (this.alarmMode !== alarmMode.stay) {
        this.alarmMode = alarmMode.stay; // set mode before loading zones, it matters
        this.loadZones();
        bitdogClient.configuration.set(constants.ALARM_NODE, this.alarmMode);

    }

    bitdogClient.sendData('bd-alarmEvent', coreMessageSchemas.alarmEventMessageSchema, function (newMessage) {
        newMessage.status = alarmMode.alarmClear;
        newMessage.event = message;
    });

    this.isAlarmed = false;

};

BitdogAlarm.prototype.disarm = function (message) {

    if (this.alarmMode !== alarmMode.disarmed) {
        this.alarmMode = alarmMode.disarmed;
        bitdogClient.configuration.set(constants.ALARM_NODE, this.alarmMode);
    }

    bitdogClient.sendData('bd-alarmEvent', coreMessageSchemas.alarmEventMessageSchema, function (newMessage) {
        newMessage.status = alarmMode.alarmClear;
        newMessage.event = message;
    });

    this.isAlarmed = false;

};

BitdogAlarm.prototype.loadZones = function () {
    var zoneIndex = 0;
    var deviceIndex = 0;
    var zone = null;
    var definition = null;
    var nodeId = null;
    var zwaveNodeId = null;
    var zoneDevices = null;
    var zoneDevice = null;
    var shouldAddDevice = false;
    var zones = null;

    this.zones = bitdogClient.configuration.get(constants.ZONES_CONFIG);
    this.monitoredDevices = {};

    if (typeof this.zones !== typeof undefined && this.zones !== null) {
        for (zoneIndex = 0; zoneIndex < this.zones.length; zoneIndex++) {
            zone = this.zones[zoneIndex];
            definition = zone.definition;
            if (typeof definition !== typeof undefined && definition !== null) {
                zoneDevices = definition.zoneDevices;
                if (typeof zoneDevices !== typeof undefined && zoneDevices !== null) {
                    for (deviceIndex in zoneDevices) {
                        shouldAddDevice = false;
                        zoneDevice = zoneDevices[deviceIndex];

                        if (zoneDevice.include === true) {
                            // some devices are not for away and stay but for safety
                            if (typeof zoneDevice.away === typeof undefined && typeof zoneDevice.stay === typeof undefined) {
                                shouldAddDevice = true;
                            } else if (zoneDevice.stay === true && this.alarmMode === alarmMode.stay) {
                                shouldAddDevice = true;
                            } else if (zoneDevice.away === true && this.alarmMode === alarmMode.away) {
                                shouldAddDevice = true;
                            }
                        }

                        if (shouldAddDevice === true) {
                            zones = this.monitoredDevices[deviceIndex];

                            if (typeof zones === typeof undefined || zones === null) {
                                zones = [];
                                this.monitoredDevices[deviceIndex] = zones;
                            }

                            zones.push(zone);
                        }

                    }
                }
            }

        }
    }
};

module.exports = new BitdogAlarm();