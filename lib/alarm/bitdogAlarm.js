var EventProcessor = require('../eventProcessor.js').EventProcessor;
var Zone = require('./zone.js');
var util = require('util');



function BitdogAlarm() {
    var _zones = [];

    this.__defineGetter__('zones', function () { return _zones; });
}

util.inherits(BitdogAlarm, EventProcessor);

BitdogAlarm.prototype.onProcessMessage = function (message) {
    
}

BitdogAlarm.prototype.armAway = function (message) {

}

BitdogAlarm.prototype.armStay = function (message) {

}
BitdogAlarm.prototype.disarm = function (message) {

}

module.exports = new BitdogAlarm();