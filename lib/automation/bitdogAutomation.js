var EventProcessor = require('../eventProcessor.js').EventProcessor;
var util = require('util');
var bitdogClient = require('bitdog-client');


function BitdogAutomation() {
    var _bitdogZWave = null;

    // Pass in the external zwave controller instance so that brain can send its own commands
    this.__defineGetter__('bitdogZWave', function () { return _bitdogZWave; });
    this.__defineSetter__('bitdogZWave', function (value) { _bitdogZWave = value; });
}

util.inherits(BitdogAutomation, EventProcessor);


BitdogAutomation.prototype.onProcessMessage = function (message) {
   
}

module.exports = new BitdogAutomation();