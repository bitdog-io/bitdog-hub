var EventProcessor = require('../eventProcessor.js').EventProcessor;
var util = require('util');


function BitdogAlarm() {

}

util.inherits(BitdogAlarm, EventProcessor);

BitdogAlarm.prototype.onProcessMessage = function (message) {
    console.log('alarm', message);
}

BitdogAlarm.prototype.armAway = function (message) {

}

BitdogAlarm.prototype.armStay = function (message) {

}
BitdogAlarm.prototype.disarm = function (message) {

}

module.exports = new BitdogAlarm();