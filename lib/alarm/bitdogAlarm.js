//-----------------------------------------------------------------------------
//
//	bitdogAlarm.js
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

    this.__defineGetter__('zones', function () { return _zones; });
    this.__defineSetter__('zones', function (value) {  _zones = value; });

    this.__defineGetter__('alarmMode', function () { return _alarmMode; });

    // Pass in the external zwave controller instance
    this.__defineGetter__('bitdogZWave', function () { return _bitdogZWave; });
    this.__defineSetter__('bitdogZWave', function (value) { _bitdogZWave = value; });

}

util.inherits(BitdogAlarm, EventProcessor);

BitdogAlarm.prototype.onProcessMessage = function (message) {
    if (this.alarmMode !== alarmMode.disarmed) {

    }
}

BitdogAlarm.prototype.armAway = function (message) {
    this.loadZones();
    this.alarmMode = alarmMode.armAway;

    bitdogClient.sendData('bd-aStatusChanged', coreMessageSchemas.alarmStatusChangedMessageSchema, function (message) {
        message.status = thia.alarmMode;
    });
};

BitdogAlarm.prototype.armStay = function (message) {
    this.loadZones();
    this.alarmMode = alarmMode.armStay;

    bitdogClient.sendData('bd-aStatusChanged', coreMessageSchemas.alarmStatusChangedMessageSchema, function (message) {
        message.status = thia.alarmMode;
    });
};

BitdogAlarm.prototype.disarm = function (message) {
    this.alarmMode = alarmMode.disarmed;

    bitdogClient.sendData('bd-aStatusChanged', coreMessageSchemas.alarmStatusChangedMessageSchema, function (message) {
        message.status = thia.alarmMode;
    });
};

BitdogAlarm.prototype.loadZones = function () {
    this.zones = bitdogClient.configuration.get(constants.ZONES_CONFIG);
};

module.exports = new BitdogAlarm();