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


function BitdogAlarm() {
    var _zones = [];
    var _bitdogZWave = null;

    this.__defineGetter__('zones', function () { return _zones; });

    // Pass in the external zwave controller instance
    this.__defineGetter__('bitdogZWave', function () { return _bitdogZWave; });
    this.__defineSetter__('bitdogZWave', function (value) { _bitdogZWave = value; });

}

util.inherits(BitdogAlarm, EventProcessor);

BitdogAlarm.prototype.onProcessMessage = function (message) {
    
}

BitdogAlarm.prototype.armAway = function (message) {
    bitdogClient.sendData('bd-aStatusChanged', coreMessageSchemas.alarmStatusChangedMessageSchema, function (message) {
        message.status = alarmMode.away;
    });
}

BitdogAlarm.prototype.armStay = function (message) {
    bitdogClient.sendData('bd-aStatusChanged', coreMessageSchemas.alarmStatusChangedMessageSchema, function (message) {
        message.status = alarmMode.stay;
    });
}

BitdogAlarm.prototype.disarm = function (message) {
    bitdogClient.sendData('bd-aStatusChanged', coreMessageSchemas.alarmStatusChangedMessageSchema, function (message) {
        message.status = alarmMode.disarmed;
    });
}

module.exports = new BitdogAlarm();