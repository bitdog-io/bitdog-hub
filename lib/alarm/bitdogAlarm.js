var EventProcessor = require('../eventProcessor.js').EventProcessor;
var Zone = require('./zone.js');
var util = require('util');
var bitdogClient = require('bitdog-client');
var alarmMode = require('./alarmMode.js');

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
    bitdogClient.sendData('bd-aStatusChanged', coreMessageSchemas.zwaveNodeMessageSchema, function (message) {
        message.status = alarmMode.away;
    });
}

BitdogAlarm.prototype.armStay = function (message) {
    bitdogClient.sendData('bd-aStatusChanged', coreMessageSchemas.zwaveNodeMessageSchema, function (message) {
        message.status = alarmMode.stay;
    });
}

BitdogAlarm.prototype.disarm = function (message) {
    bitdogClient.sendData('bd-aStatusChanged', coreMessageSchemas.zwaveNodeMessageSchema, function (message) {
        message.status = alarmMode.disarmed;
    });
}

module.exports = new BitdogAlarm();